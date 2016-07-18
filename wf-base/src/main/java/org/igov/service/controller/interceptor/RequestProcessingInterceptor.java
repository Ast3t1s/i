/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.igov.service.controller.interceptor;

import org.activiti.engine.HistoryService;
import org.activiti.engine.RepositoryService;
import org.activiti.engine.RuntimeService;
import org.activiti.engine.TaskService;
import org.activiti.engine.history.HistoricProcessInstance;
import org.activiti.engine.history.HistoricTaskInstance;
import org.activiti.engine.repository.ProcessDefinition;
import org.activiti.engine.runtime.ProcessInstance;
import org.activiti.engine.task.Task;
import org.igov.io.GeneralConfig;
import org.igov.io.mail.NotificationPatterns;
import org.igov.io.web.HttpRequester;
import org.igov.model.action.event.HistoryEvent_Service_StatusType;
import org.igov.model.escalation.EscalationHistory;
import org.igov.service.business.action.event.HistoryEventService;
import org.igov.service.business.action.task.bp.handler.BpServiceHandler;
import org.igov.service.business.escalation.EscalationHistoryService;
import org.igov.service.business.msg.MsgService;
import org.igov.service.exception.CommonUtils;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.igov.io.Log;

import static org.igov.util.Tool.sCut;

/**
 * @author olya
 */
public class RequestProcessingInterceptor extends HandlerInterceptorAdapter {

    private static final Logger LOG = LoggerFactory.getLogger(RequestProcessingInterceptor.class);
    private static final Logger LOG_BIG = LoggerFactory.getLogger("ControllerBig");
    //private static final Logger LOG_BIG = LoggerFactory.getLogger('APP');
    private boolean bFinish = false;

    private static final Pattern TAG_PATTERN_PREFIX = Pattern.compile("runtime/tasks/[0-9]+$");
    private final String URI_SYNC_CONTACTS = "/wf/service/subject/syncContacts";

    @Autowired
    protected RuntimeService runtimeService;
    @Autowired
    GeneralConfig generalConfig;
    @Autowired
    HttpRequester httpRequester;
    @Autowired
    NotificationPatterns oNotificationPatterns;
    @Autowired
    private HistoryService historyService;
    @Autowired
    private RepositoryService repositoryService;
    @Autowired
    private TaskService taskService;
    @Autowired
    private HistoryEventService historyEventService;
    @Autowired
    private BpServiceHandler bpHandler;
    @Autowired
    private EscalationHistoryService escalationHistoryService;

    private JSONParser oJSONParser = new JSONParser();

    @Override
    public boolean preHandle(HttpServletRequest oRequest,
            HttpServletResponse response, Object handler) throws Exception {

        bFinish = false;
        long startTime = System.currentTimeMillis();
        LOG.info("(getMethod()={}, getRequestURL()={})", oRequest.getMethod().trim(), oRequest.getRequestURL().toString());
        LOG_BIG.info("(getMethod()={}, getRequestURL()={})", oRequest.getMethod().trim(), oRequest.getRequestURL().toString());
        oRequest.setAttribute("startTime", startTime);
        protocolize(oRequest, response, false);
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request,
            HttpServletResponse response, Object handler,
            ModelAndView modelAndView) throws Exception {
    }

    @Override
    public void afterCompletion(HttpServletRequest oRequest,
            HttpServletResponse oResponse, Object handler, Exception ex)
            throws Exception {
        bFinish = true;
        LOG.info("(nElapsedMS={})", System.currentTimeMillis() - (Long) oRequest.getAttribute("startTime"));
        LOG_BIG.info("(nElapsedMS={})", System.currentTimeMillis() - (Long) oRequest.getAttribute("startTime"));
        oResponse = ((MultiReaderHttpServletResponse) oRequest.getAttribute("responseMultiRead") != null
                ? (MultiReaderHttpServletResponse) oRequest.getAttribute("responseMultiRead") : oResponse);
        protocolize(oRequest, oResponse, true);
    }

    private void protocolize(HttpServletRequest oRequest, HttpServletResponse oResponse, boolean bSaveHistory)
            throws IOException {
        LOG.info("Method 'protocolize' started");
        int nLen = generalConfig.isSelfTest() ? 300 : 200;

        Map<String, String> mRequestParam = new HashMap<>();
        Enumeration paramsName = oRequest.getParameterNames();
        while (paramsName.hasMoreElements()) {
            String sKey = (String) paramsName.nextElement();
            mRequestParam.put(sKey, oRequest.getParameter(sKey));
        }

        StringBuilder osRequestBody = new StringBuilder();
        BufferedReader oReader = oRequest.getReader();
        String line;
        if (oReader != null) {
            while ((line = oReader.readLine()) != null) {
                osRequestBody.append(line);
            }
            //mParamRequest.put("requestBody", buffer.toString()); 
            //TODO temp
        }
        String sURL = oRequest.getRequestURL().toString();
        String snTaskId = null;
        //getting task id from URL, if URL matches runtime/tasks/{taskId} (#1234)
        if (TAG_PATTERN_PREFIX.matcher(oRequest.getRequestURL()).find()) {
            snTaskId = sURL.substring(sURL.lastIndexOf("/") + 1);
            LOG.info("URL is like runtime/tasks/{taskId}, getting task id from url, task id is " + snTaskId);
        }

        if (snTaskId != null && mRequestParam.get("taskId") == null) {
            mRequestParam.put("taskId", snTaskId);
        }

        String sRequestBody = osRequestBody.toString();
        if (!bFinish) {
            LOG.info("(mRequestParam={})", mRequestParam);
            LOG.info("(sRequestBody={})", sCut(nLen, sRequestBody));
            if (sURL.endsWith("/service/document/setDocumentFile")
                    || sURL.contains("/service/object/file/")) {
            } else {
                LOG_BIG.debug("(sRequestBody={})", sRequestBody);
            }
        }
        //oLogBig_Interceptor.info("sRequestBody: " + sRequestBody);
        //LOG.debug("sRequestBody: " + sRequestBody);

        String sResponseBody = oResponse.toString();
        if (bFinish) {
            LOG.info("(sResponseBody={})", sCut(nLen, sResponseBody));
            //LOG.debug("(sResponseBody: {})", sResponseBody);
            //https://region.igov.org.ua/wf/service/form/form-data
            if (sURL.endsWith("/service/action/item/getService")
                    || sURL.endsWith("/service/action/item/getServicesTree")
                    || (sURL.endsWith("/service/form/form-data") && "GET"
                    .equalsIgnoreCase(oRequest.getMethod().trim()))
                    || sURL.endsWith("/service/repository/process-definitions")
                    || sURL.endsWith("/service/action/task/getStartFormData")
                    || sURL.endsWith("/service/action/task/getOrderMessages_Local")
                    || sURL.endsWith("/service/action/flow/getFlowSlots_ServiceData")
                    //|| sURL.endsWith("/runtime/tasks/9514334/attachments")
                    //|| sURL.contains("/runtime/tasks/")
                    || sURL.contains("/service/runtime/tasks")
                    || sURL.endsWith("/service/history/historic-task-instances")
                    || sURL.endsWith("/service/action/task/getLoginBPs")
                    || sURL.endsWith("/service/subject/message/getMessages")
                    || sURL.endsWith("/service/subject/message/getServiceMessages")
                    || sURL.endsWith("/service/object/place/getPlacesTree")
                    || sURL.endsWith("/service/action/event/getLastTaskHistory")
                    || sURL.endsWith("/service/action/event/getLastTaskHistory")
                    || sURL.endsWith("/service/action/event/getHistoryEventsService")
                    || sURL.endsWith("/service/action/event/getHistoryEvents")
                    || sURL.endsWith("/service/document/getDocumentContent")
                    || sURL.endsWith("/service/document/getDocumentFile")
                    || sURL.endsWith("/service/document/getDocumentAbstract")
                    || sURL.endsWith("/service/document/getDocuments")
                    || sURL.endsWith("/service/document/setDocumentFile")
                    || sURL.contains("/service/object/file/")
                    || sURL.contains("/service/document/getDocumentAbstract")) {
            } else {
                LOG_BIG.debug("(sResponseBody={})", sResponseBody);
            }
        }

        //LOG.debug("sResponseBody: " + (sResponseBody != null ? sResponseBody : "null"));
        //oLogBig_Controller.info("sResponseBody: " + (sResponseBody != null ? sResponseBody : "null"));
        String sType="";
        try {
        	LOG.info("URL: {} method: {}", oRequest.getRequestURL(), oRequest.getMethod());
            if (!bSaveHistory || !(oResponse.getStatus() >= HttpStatus.OK.value()
                    && oResponse.getStatus() < HttpStatus.BAD_REQUEST.value())) {
            	LOG.info("returning from protocolize block: bSaveHistory:{} oResponse.getStatus():{}", bSaveHistory, oResponse.getStatus());
                return;
            }
            if (isSaveTask(oRequest, sResponseBody)) {
                sType="Save";
                LOG.info("saveNewTaskInfo block");
                saveNewTaskInfo(sRequestBody, sResponseBody, mRequestParam);
            } else if (isCloseTask(oRequest, sResponseBody)) {
                sType="Close";
                LOG.info("saveClosedTaskInfo block started");
                saveClosedTaskInfo(sRequestBody, snTaskId);
            } else if (isUpdateTask(oRequest)) {
                sType="Update";
            	LOG.info("saveUpdatedTaskInfo block");
                saveUpdatedTaskInfo(sResponseBody, mRequestParam);
            }
        } catch (Exception oException) {
            //LOG.error("Can't save service-history record: {}", oException.getMessage());
            //LOG.error("Can't save service-history record: {}" + " mRequestParam: " + mRequestParam + "sRequestBody: "
            //        + sRequestBody + " sResponseBody: " + sResponseBody, oException);
            LOG_BIG.error("Can't save service-history record: {}", oException.getMessage());
            LOG_BIG.error("FAIL:", oException);
            try {
                new Log(oException, LOG)//this.getClass()
                    ._Case("IC_Task"+sType)
                    ._Status(Log.LogStatus.ERROR)
                    ._Head("Can't save service-history record")
//                    ._Body(oException.getMessage())
                    ._Param("sURL", sURL)
                    ._Param("mRequestParam", mRequestParam)
                    ._Param("sRequestBody", sRequestBody)
                    ._Param("sResponseBody", sResponseBody)
                    ._LogTrace()
                    .save()
                ;
        	/*MsgService.setEventSystemWithParam("INTERNAL_ERROR", null, null, "Interceptor_protocolize", "Can't save service-history record",
		    sResponseBody, CommonUtils.getStringStackTrace(oException), mRequestParam);*/
            } catch (Exception e) {
        	LOG.error("Cann't send an error message to service MSG\n", e);
            }
            
        }
        LOG.info("Method 'protocolize' finished");
    }

    private boolean isUpdateTask(HttpServletRequest oRequest) {
        return oRequest.getRequestURL().toString().indexOf("/runtime/tasks") > 0
                && "PUT".equalsIgnoreCase(oRequest.getMethod().trim());
    }

    private boolean isCloseTask(HttpServletRequest oRequest, String sResponseBody) {
        return "POST".equalsIgnoreCase(oRequest.getMethod().trim())
                && (((sResponseBody == null || "".equals(sResponseBody))
                && oRequest.getRequestURL().toString().indexOf("/form/form-data") > 0)
                || TAG_PATTERN_PREFIX.matcher(oRequest.getRequestURL()).find());
    }

    private boolean isSaveTask(HttpServletRequest oRequest, String sResponseBody) {
        //LOG.info("(is save task sResponseBody {}, '/form/form-data' {}. Method {} )", sResponseBody, oRequest.getRequestURL().toString().indexOf("/form/form-data"),oRequest.getMethod());
        return (sResponseBody != null && !"".equals(sResponseBody))
                && oRequest.getRequestURL().toString().indexOf("/form/form-data") > 0
                && "POST".equalsIgnoreCase(oRequest.getMethod().trim());
    }

    private void saveNewTaskInfo(String sRequestBody, String sResponseBody, Map<String, String> mParamRequest)
            throws Exception {
        Map<String, String> mParam = new HashMap<>();
        JSONObject omRequestBody = (JSONObject) oJSONParser.parse(sRequestBody);
        JSONObject omResponseBody = (JSONObject) oJSONParser.parse(sResponseBody);
        mParam.put("nID_StatusType", HistoryEvent_Service_StatusType.CREATED.getnID().toString());

        String snID_Process = String.valueOf(omResponseBody.get("id"));
        Long nID_Process = Long.valueOf(snID_Process);
        String sID_Order = generalConfig.getOrderId_ByProcess(nID_Process);
        String snID_Subject = String.valueOf(omRequestBody.get("nID_Subject"));
        mParam.put("nID_Subject", snID_Subject);

        LOG.info("(sID_Order={},nID_Subject={})", sID_Order, snID_Subject);

        String snID_Service = mParamRequest.get("nID_Service");
        if (snID_Service != null) {
            mParam.put("nID_Service", snID_Service);
        }

        String sID_UA = mParamRequest.get("sID_UA");
        if (sID_UA != null) {
            mParam.put("sID_UA", sID_UA);
        }

        //TODO: need remove infuture
        String snID_Region = mParamRequest.get("nID_Region");
        if (snID_Region != null) {
            mParam.put("nID_Region", snID_Region);
        }

        Long nID_ServiceData = (Long) omResponseBody.get("nID_ServiceData");
        if (nID_ServiceData != null) {
            mParam.put("nID_ServiceData", nID_ServiceData + "");
        }

        HistoricProcessInstance oHistoricProcessInstance
                = historyService.createHistoricProcessInstanceQuery().processInstanceId(snID_Process).singleResult();
        ProcessDefinition oProcessDefinition = repositoryService.createProcessDefinitionQuery()
                .processDefinitionId(oHistoricProcessInstance.getProcessDefinitionId()).singleResult();
        String sProcessName = oProcessDefinition.getName() != null ? oProcessDefinition.getName() : "";
        //mParam.put("sProcessInstanceName", sProcessInstanceName);
        mParam.put("sHead", sProcessName);

        List<Task> aTask = taskService.createTaskQuery().processInstanceId(snID_Process).list();
        boolean bProcessClosed = aTask == null || aTask.size() == 0;
        String sUserTaskName = bProcessClosed ? "закрита" : aTask.get(0).getName();//"(нет назви)"

        String sMailTo = JsonRequestDataResolver.getEmail(omRequestBody);
        String sPhone = String.valueOf(JsonRequestDataResolver.getPhone(omRequestBody));
        String bankIdFirstName = JsonRequestDataResolver.getBankIdFirstName(omRequestBody);
        String bankIdLastName = JsonRequestDataResolver.getBankIdLastName(omRequestBody);

        if (sMailTo != null) {
            LOG.info("Send notification mail... (sMailTo={})", sMailTo);
            oNotificationPatterns.sendTaskCreatedInfoEmail(sMailTo, sID_Order, bankIdFirstName, bankIdLastName);
        }

        if (sMailTo != null || sPhone != null) {
            try {
                Map<String, String> mParamSync = new HashMap<String, String>();
                mParamSync.put("snID_Subject", snID_Subject);
                mParamSync.put("sMailTo", sMailTo);
                mParamSync.put("sPhone", sPhone);
                LOG.info("Вносим параметры в коллекцию (sMailTo {}, snID_Subject {}, sPhone {})", sMailTo, snID_Subject,
                        sPhone);
                String sURL = generalConfig.getSelfHostCentral() + URI_SYNC_CONTACTS;
                LOG.info("(Подключаемся к центральному порталу)");
                String sResponse = httpRequester.getInside(sURL, mParamSync);
                LOG.info("(Подключение осуществлено)");

            } catch (Exception ex) {
                LOG.warn("(isSaveTask exception {})", ex.getMessage());
            }

        }

        historyEventService.addHistoryEvent(sID_Order, sUserTaskName, mParam);
        //LOG.info("ok!");
    }
    
    private void saveComment(JSONObject omRequestBody, HistoricTaskInstance oHistoricTaskInstance) {
        LOG_BIG.debug("omRequestBody = {}", omRequestBody);
        
        LOG_BIG.debug("oHistoricTaskInstance.getDurationInMillis = {}", oHistoricTaskInstance.getDurationInMillis());
        LOG_BIG.debug("oHistoricTaskInstance.getProcessDefinitionId = {}", oHistoricTaskInstance.getProcessDefinitionId());
        LOG_BIG.debug("oHistoricTaskInstance.getProcessInstanceId = {}", oHistoricTaskInstance.getProcessInstanceId());
    }

    //(#1234) added additional parameter snClosedTaskId
    private void saveClosedTaskInfo(String sRequestBody, String snClosedTaskId) throws Exception {
        LOG.info("Method saveClosedTaskInfo started");
        Map<String, String> mParam = new HashMap<>();
        JSONObject omRequestBody = (JSONObject) oJSONParser.parse(sRequestBody);
        
        mParam.put("nID_StatusType", HistoryEvent_Service_StatusType.CLOSED.getnID().toString());

        String snID_Task = (String) omRequestBody.get("taskId");
        if ((snID_Task == null) && (snClosedTaskId != null)) {
            snID_Task = snClosedTaskId.trim();
            LOG.info("Task id from requestbody is null, so using task id from url - " + snID_Task);
        }
        LOG.info("Task id is - " + snID_Task);
        if (snID_Task != null) {
            HistoricTaskInstance oHistoricTaskInstance = historyService.createHistoricTaskInstanceQuery()
                    .taskId(snID_Task).singleResult();
            saveComment(omRequestBody, oHistoricTaskInstance);
            
            String snID_Process = oHistoricTaskInstance.getProcessInstanceId();
            
            closeEscalationProcessIfExists(snID_Process);
            if (snID_Process != null) {
                LOG.info("Parsing snID_Process: " + snID_Process + " to long");
                Long nID_Process = Long.valueOf(snID_Process);
                String sID_Order = generalConfig.getOrderId_ByProcess(nID_Process);
                String snMinutesDurationProcess = getTotalTimeOfExecution(snID_Process);
                mParam.put("nTimeMinutes", snMinutesDurationProcess);
                LOG.info("(sID_Order={},nMinutesDurationProcess={})", sID_Order, snMinutesDurationProcess);
                List<Task> aTask = taskService.createTaskQuery().processInstanceId(snID_Process).list();
                boolean bProcessClosed = aTask == null || aTask.isEmpty();
                String sUserTaskName = bProcessClosed ? "закрита" : aTask.get(0).getName();

                String sProcessName = oHistoricTaskInstance.getProcessDefinitionId();
                try {
                    if (bProcessClosed && sProcessName.indexOf("system") != 0) {//issue 962
                        //LOG.info(String.format("start process feedback for process with snID_Process=%s", snID_Process));
                        if (!generalConfig.isSelfTest()) {
                            String snID_Proccess_Feedback = bpHandler
                                    .startFeedbackProcess(snID_Task, snID_Process, sProcessName);
                            mParam.put("nID_Proccess_Feedback", snID_Proccess_Feedback);
                            LOG.info("Create escalation process! (sProcessName={}, nID_Proccess_Feedback={})",
                                    sProcessName,
                                    snID_Proccess_Feedback);
                        } else {
                            LOG.info("SKIPED(test)!!! Create escalation process! (sProcessName={})", sProcessName);
                        }
                    }
                } catch (Exception oException) {
                    //LOG.error("Can't create escalation process: {}", oException.getMessage());
                    //LOG.trace("FAIL:", oException);
                    new Log(oException, LOG)//this.getClass()
                        ._Case("IC_CreateEscalation")
                        ._Status(Log.LogStatus.ERROR)
                        ._Head("Can't create escalation process")
//                        ._Body(oException.getMessage())
                        ._Param("nID_Process", nID_Process)
                        ._LogTrace()
                        .save()
                    ;
                }
                try {
                    if (sProcessName.indexOf(BpServiceHandler.PROCESS_ESCALATION) == 0) {
                        //issue 981 -- save history
                        EscalationHistory escalationHistory = escalationHistoryService.updateStatus(nID_Process,
                                bProcessClosed
                                        ? EscalationHistoryService.STATUS_CLOSED
                                        : EscalationHistoryService.STATUS_IN_WORK);
                        //                LOG.info("update escalation history: {}", escalationHistory);
                        //issue 1038 -- save message
                        //LOG.info("try to save service message for escalation process with (snID_Process={})", snID_Process);
                        String sServiceMessage = bpHandler.createServiceMessage(snID_Task);
                        //LOG.info("(sServiceMessage={})", sServiceMessage);
                        LOG.info(
                                "Updated escalation history and create service message! (sProcessName={}, sServiceMessage={})",
                                sProcessName, sServiceMessage);
                    }
                } catch (Exception oException) {
                    //LOG.error("Can't save service message for escalation: {}", oException.getMessage());
                    //LOG.trace("FAIL:", oException);
                    new Log(oException, LOG)//this.getClass()
                        ._Case("IC_SaveEscalation")
                        ._Status(Log.LogStatus.ERROR)
                        ._Head("Can't save service message for escalation")
//                        ._Body(oException.getMessage())
                        ._Param("nID_Process", nID_Process)
                        .save()
                    ;
                }
                if (bProcessClosed){
	                historyEventService
	                        .updateHistoryEvent(sID_Order, sUserTaskName, false, HistoryEvent_Service_StatusType.CLOSED,
	                                mParam);//sID_Process
                }
            }
        }
        LOG.info("Method saveClosedTaskInfo finished");
    }

    private void saveUpdatedTaskInfo(String sResponseBody, Map<String, String> mRequestParam) throws Exception {
        Map<String, String> mParam = new HashMap<>();
        JSONObject omResponseBody = (JSONObject) oJSONParser.parse(sResponseBody);
        String sUserTaskName = HistoryEvent_Service_StatusType.OPENED_ASSIGNED.getsName_UA();
        mParam.put("nID_StatusType", HistoryEvent_Service_StatusType.OPENED_ASSIGNED.getnID().toString());

        String snID_Task = (String) omResponseBody.get("taskId");
        LOG.info("Looking for a task with ID {}", snID_Task);
        if (snID_Task == null && mRequestParam.containsKey("taskId")){
        	snID_Task = (String) mRequestParam.get("taskId");
        	LOG.info("Found taskId in mRequestParam {}", snID_Task);
        }
        HistoricTaskInstance oHistoricTaskInstance = historyService.createHistoricTaskInstanceQuery().taskId(snID_Task)
                .singleResult();

        //String sID_Process = historicTaskInstance.getProcessInstanceId();
        String snID_Process = oHistoricTaskInstance.getProcessInstanceId();
        //LOG.info("(snID_Process={})", snID_Process);
        
        closeEscalationProcessIfExists(snID_Process);
        Long nID_Process = Long.valueOf(snID_Process);
        String sID_Order = generalConfig.getOrderId_ByProcess(nID_Process);
        LOG.info("(sID_Order={})", sID_Order);

        String sSubjectInfo = mRequestParam.get("sSubjectInfo");
        if (sSubjectInfo != null) {
            mParam.put("sSubjectInfo", sSubjectInfo);
        }
        if (mRequestParam.get("nID_Subject") != null) {
            String nID_Subject = String.valueOf(mRequestParam.get("nID_Subject"));
            mParam.put("nID_Subject", nID_Subject);
        }
        //historyEventService.updateHistoryEvent(sID_Order, sUserTaskName, false, null);
        historyEventService
                .updateHistoryEvent(sID_Order, sUserTaskName, false, HistoryEvent_Service_StatusType.OPENED_ASSIGNED,
                        mParam);

        //
        String sProcessName = oHistoricTaskInstance.getProcessDefinitionId();
        //LOG.info("(sProcessName={})", sProcessName);
        try {
            LOG.info("Update escalation history... (sProcessName={})", sProcessName);
            if (sProcessName.indexOf(BpServiceHandler.PROCESS_ESCALATION) == 0) {//issue 981
                //LOG.info("begin update escalation history");
                escalationHistoryService
                        .updateStatus(nID_Process, EscalationHistoryService.STATUS_IN_WORK);//Long.valueOf(sID_Process)
            } else { //issue 1297
                LOG.trace("BpServiceHandler.PROCESS_ESCALATION = {}", BpServiceHandler.PROCESS_ESCALATION);
            }
        } catch (Exception oException) {
            //LOG.error("Error: {}", oException.getMessage());
            //LOG.trace("FAIL:", oException);
            new Log(oException, LOG)//this.getClass()
                ._Case("IC_UpdateEscalation")
                ._Status(Log.LogStatus.ERROR)
                ._Head("Can't update escalation history")
//                ._Body(oException.getMessage())
                ._Param("nID_Process", nID_Process)
                ._LogTrace()
                .save()
            ;
        }
    }

    protected String getTotalTimeOfExecution(String sID_Process) {
        HistoricProcessInstance oHistoricProcessInstance = historyService.createHistoricProcessInstanceQuery()
                .processInstanceId(sID_Process).singleResult();
        String sReturn = "-1";
        try {
            LOG_BIG.debug("Found completed process with sID_Process = {} ", sID_Process);
            if (oHistoricProcessInstance != null) {
        	Long nMinutesDurationProcess  =  oHistoricProcessInstance.getDurationInMillis();
        	LOG_BIG.debug("nMinutesDurationProcess = {}, ms", nMinutesDurationProcess);

                if ( nMinutesDurationProcess != null ) {
                    nMinutesDurationProcess = nMinutesDurationProcess / (1000 * 60);
                    LOG_BIG.debug("nMinutesDurationProcess = {}, min", nMinutesDurationProcess);

                    sReturn = Long.toString(nMinutesDurationProcess);
                }
            }
            //LOG.info(String.format("Calculated time of execution of process sID_Process=%s and nMinutesDurationProcess=%s", sID_Process, nMinutesDurationProcess));
            //LOG.info("(sID_Process={},nMinutesDurationProcess={})", sID_Process, nMinutesDurationProcess);
        } catch (Exception oException) {
            //LOG.error("{} (sID_Process={})", oException.getMessage(), sID_Process);
            //LOG.trace("FAIL: ", oException);
            new Log(oException, LOG)//this.getClass()
                ._Case("IC_TimeExecution")
                ._Status(Log.LogStatus.ERROR)
                ._Head("Can't close escalation for task")
//                ._Body(oException.getMessage())
                ._Param("sID_Process", sID_Process)
                ._LogTrace()
                .save()
            ;
        }
        return sReturn;
    }
    
    protected void closeEscalationProcessIfExists(String sID_Process){
    	LOG.info("Looking for escalation processes for process {}", sID_Process);
    	List<ProcessInstance> escalationProceses = runtimeService.createProcessInstanceQuery().active().variableValueEquals("processID", sID_Process).list();
    	
    	if (escalationProceses != null && escalationProceses.size() > 0){
	    	LOG.info("Found {} escalation processes", escalationProceses.size());
	    	
	    	Map<String, String> mParam = new HashMap<>();
	        mParam.put("nID_Proccess_Escalation", "-1");
	        LOG.info(" >>Clearing nID_Proccess_Escalation field for the process . (sID_Process={})", sID_Process);
            try {
            	LOG.info(" updateHistoryEvent: " + sID_Process + " mParam: " + mParam);
                historyEventService.updateHistoryEvent(generalConfig.getOrderId_ByProcess(Long.valueOf(sID_Process)), null, false, HistoryEvent_Service_StatusType.UNKNOWN, mParam);
            } catch (Exception oException) {
                    //LOG.error("{} (sID_Process={})", oException.getMessage(), sID_Process);
                    //LOG.trace("FAIL: ", oException);
                    new Log(oException, LOG)//this.getClass()
                        ._Case("IC_CloseEscalation")
                        ._Status(Log.LogStatus.ERROR)
                        ._Head("Can't close escalation for task")
//                        ._Body(oException.getMessage())
                        ._Param("sID_Process", sID_Process)
                        ._Param("mParam", mParam)
                        ._LogTrace()
                        .save()
                    ;
            }
            
	    	for (ProcessInstance process : escalationProceses){
	    		LOG.info("Removing process with ID:Key {}:{} ", process.getProcessInstanceId(), process.getProcessDefinitionKey());
	    		runtimeService.deleteProcessInstance(process.getProcessInstanceId(), "State of initial process has been changed. Removing escalaton process");
	    	}
    	}
    }

}
