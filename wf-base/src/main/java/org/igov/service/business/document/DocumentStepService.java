package org.igov.service.business.document;

import com.mongodb.util.Hash;
import java.io.IOException;
import java.net.URISyntaxException;
import org.activiti.engine.*;
import org.activiti.engine.form.FormProperty;
import org.activiti.engine.identity.Group;
import org.activiti.engine.impl.util.json.JSONArray;
import org.activiti.engine.impl.util.json.JSONObject;
import org.activiti.engine.runtime.ProcessInstance;
import org.activiti.engine.task.Task;
import org.apache.commons.lang3.StringUtils;
import org.igov.io.db.kv.temp.exception.RecordInmemoryException;
import org.igov.model.core.GenericEntityDao;
import org.igov.model.document.DocumentStep;
import org.igov.model.document.DocumentStepDao;
import org.igov.model.document.DocumentStepSubjectRight;
import org.igov.model.document.DocumentStepSubjectRightField;
import org.igov.service.exception.CRCInvalidException;
import org.igov.service.exception.RecordNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.DelegateTask;
import org.activiti.engine.history.HistoricProcessInstance;
import org.activiti.engine.identity.User;
import org.activiti.engine.task.IdentityLink;
import static org.igov.io.fs.FileSystemData.getFileData_Pattern;
import org.igov.model.document.DocumentStepSubjectRightDao;
import org.igov.util.Tool;
import org.joda.time.DateTime;
import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Component;

@Component("documentStepService")
@Service
public class DocumentStepService {

    private static final Logger LOG = LoggerFactory.getLogger(DocumentStepService.class);

    @Autowired
    @Qualifier("documentStepDao")
    private GenericEntityDao<Long, DocumentStep> documentStepDao;

    @Autowired
    private DocumentStepSubjectRightDao oDocumentStepSubjectRightDao;

    @Autowired
    private TaskService oTaskService;

    @Autowired
    private IdentityService identityService;

    @Autowired
    private RuntimeService runtimeService;

    @Autowired
    private HistoryService historyService;

    @Autowired
    private FormService oFormService;

    @Autowired
    private IdentityService oIdentityService;

    //public void setDocumentSteps(String snID_Process_Activiti, String soJSON) {
    public List<DocumentStep> setDocumentSteps(String snID_Process_Activiti, String soJSON) {
        JSONObject oJSON = new JSONObject(soJSON);
        List<DocumentStep> aDocumentStep = new ArrayList<>();
        //process common step if it exists
        Object oStep_Common = oJSON.opt("_");
        LOG.info("Common step is - {}", oStep_Common);
        if (oStep_Common != null) {
            DocumentStep oDocumentStep_Common = mapToDocumentStep(oStep_Common);
            oDocumentStep_Common.setnOrder(0L);//common step with name "_" has order 0
            oDocumentStep_Common.setsKey_Step("_");
            oDocumentStep_Common.setSnID_Process_Activiti(snID_Process_Activiti);
            documentStepDao.saveOrUpdate(oDocumentStep_Common);
            aDocumentStep.add(oDocumentStep_Common);
        }
        //process all other steps
        //first of all we filter common step with name "_" and then just convert each step from JSON to POJO
        List<String> asKey_Step = Arrays.asList(JSONObject.getNames(oJSON));
        LOG.info("List of steps: {}", asKey_Step);
        asKey_Step = asKey_Step.stream().
                filter(sKey_Step -> !"_".equals(sKey_Step))
                .collect(Collectors.toList());
        long i = 1L;
        for (String sKey_Step : asKey_Step) {
            DocumentStep oDocumentStep = mapToDocumentStep(oJSON.get(sKey_Step));
            oDocumentStep.setnOrder(i++);
            oDocumentStep.setsKey_Step(sKey_Step);
            oDocumentStep.setSnID_Process_Activiti(snID_Process_Activiti);
            documentStepDao.saveOrUpdate(oDocumentStep);
            aDocumentStep.add(oDocumentStep);
        }
        LOG.info("Result list of steps: {}", aDocumentStep);

        return aDocumentStep;
    }

    private DocumentStep mapToDocumentStep(Object oStep_JSON) {
        JSONObject oStep = (JSONObject) oStep_JSON;
        LOG.info("try to parse step: {}", oStep);
        if (oStep == null) {
            return null;
        }

        DocumentStep oDocumentStep = new DocumentStep();
        String[] asKey_Group = JSONObject.getNames(oStep);
        List<DocumentStepSubjectRight> aDocumentStepSubjectRight = new ArrayList<>();
        for (String sKey_Group : asKey_Group) {
            JSONObject oGroup = oStep.optJSONObject(sKey_Group);
            LOG.info("group for step: {}", oGroup);

            if (oGroup == null) {
                continue;
            }
            Boolean bWrite = (Boolean) oGroup.opt("bWrite");
            if (bWrite == null) {
                throw new IllegalArgumentException("Group " + sKey_Group + " hasn't property bWrite.");
            }

            DocumentStepSubjectRight oDocumentStepSubjectRight = new DocumentStepSubjectRight();
            oDocumentStepSubjectRight.setsKey_GroupPostfix(sKey_Group);
            oDocumentStepSubjectRight.setbWrite(bWrite);

            Object sName = oGroup.opt("sName");
            if (sName != null) {
                oDocumentStepSubjectRight.setsName((String) sName);
            }

            List<DocumentStepSubjectRightField> aDocumentStepSubjectRightField = mapToFields(oGroup, oDocumentStepSubjectRight);
            oDocumentStepSubjectRight.setDocumentStepSubjectRightFields(aDocumentStepSubjectRightField);
            oDocumentStepSubjectRight.setDocumentStep(oDocumentStep);
            LOG.info("right for step: {}", oDocumentStepSubjectRight);
            aDocumentStepSubjectRight.add(oDocumentStepSubjectRight);
        }
        oDocumentStep.setRights(aDocumentStepSubjectRight);
        return oDocumentStep;
    }

//setDocumentStep(snID_Process_Activiti[, sKey_Step)]    
//3.1) setDocumentStepSubjectRight(snID_Process_Activiti, sKey_GroupPostfix, bWrite) //Установить право записи, равное bWrite, для ветки к путем sKey_Step/sKey_GroupPostfix
//3.2) cloneDocumentStepSubject(snID_Process_Activiti, sKey_GroupPostfix, sKey_GroupPostfix_New) //Клонировать ветку права записи с путем sKey_Step/sKey_GroupPostfix в ветку с путем 
    public DocumentStepSubjectRight cloneDocumentStepSubject(String snID_Process_Activiti, String sKey_GroupPostfix, String sKey_GroupPostfix_New,
            String sKey_Step_Document) {//JSONObject //Map<String, Object>
        /*LOG.info("cloneDocumentStepSubject started...");
        LOG.info("sKey_GroupPostfix={}, snID_Process_Activiti={}, sKey_GroupPostfix_New={}", sKey_GroupPostfix, snID_Process_Activiti, sKey_GroupPostfix_New);
        List<Task> aTaskActive = oTaskService.createTaskQuery().processInstanceId(snID_Process_Activiti).active().list();
        if (aTaskActive.size() < 1 || aTaskActive.get(0) == null) {
            throw new IllegalArgumentException("Process with ID: " + snID_Process_Activiti + " has no active task.");
        }
        Task oTaskActive = aTaskActive.get(0);
        String sID_BP = oTaskActive.getProcessDefinitionId();
        LOG.info("sID_BP={}", sID_BP);
        if (sID_BP != null && sID_BP.contains(":")) {
            String[] as = sID_BP.split("\\:");
            sID_BP = as[0];
            LOG.info("FIX(:) sID_BP={}", sID_BP);
        }
        if (sID_BP != null && sID_BP.contains(".")) {
            String[] as = sID_BP.split("\\.");
            sID_BP = as[0];
            LOG.info("FIX(.) sID_BP={}", sID_BP);
        }

        ProcessInstance oProcessInstance = runtimeService
                .createProcessInstanceQuery()
                .processInstanceId(snID_Process_Activiti)
                .active()
                .singleResult();
        Map<String, Object> mProcessVariable = oProcessInstance.getProcessVariables();
        LOG.info("mProcessVariable={}", mProcessVariable);
        //Map<String, Object> mProcessVariable = new HashMap();
        String snID_Task = oTaskActive.getId();
        List<FormProperty> aProperty = oFormService.getTaskFormData(snID_Task).getFormProperties();                    
        for (FormProperty oProperty : aProperty) {
            mProcessVariable.put(oProperty.getId(), oProperty.getValue());
            //String sID = oProperty.getId(); 
        }
        LOG.info("mProcessVariable(added)={}", mProcessVariable);*/
        //String sKey_Step_Document = (String) mProcessVariable.get("sKey_Step_Document");

        /*if (StringUtils.isEmpty(sKey_Step_Document)) {
            throw new IllegalStateException("There is no active Document Step! mProcessVariable=" + mProcessVariable +
            //        " Process variable sKey_Step_Document is empty.");
            //sKey_Step_Document="1";
        }*/
        List<DocumentStep> aDocumentStep = documentStepDao.findAllBy("snID_Process_Activiti", snID_Process_Activiti);
        LOG.info("aDocumentStep={}", aDocumentStep);

        DocumentStep oDocumentStep_Active = aDocumentStep
                .stream()
                .filter(o -> sKey_Step_Document == null ? o.getnOrder().equals(1) : o.getsKey_Step().equals(sKey_Step_Document))
                .findAny()
                .orElse(null);
        LOG.info("oDocumentStep_Active={}", oDocumentStep_Active);
        if (oDocumentStep_Active == null) {
            throw new IllegalStateException("There is no active Document Step, process variable sKey_Step_Document="
                    + sKey_Step_Document);
        }
        DocumentStepSubjectRight oDocumentStepSubjectRight = new DocumentStepSubjectRight();
        LOG.info("oDocumentStep_Active rights is {}", oDocumentStep_Active.getRights());

        List<DocumentStepSubjectRight> aDocumentStepSubjectRight_Source = oDocumentStep_Active.getRights();
        List<DocumentStepSubjectRight> aDocumentStepSubjectRight_SourceNew = new ArrayList<>();
        aDocumentStepSubjectRight_SourceNew.addAll(aDocumentStepSubjectRight_Source);
        LOG.info("aDocumentStepSubjectRight_Source is {}", aDocumentStepSubjectRight_Source);
        //for(DocumentStepSubjectRight oDocumentStepSubjectRight_Source : aDocumentStepSubjectRight_Source){
        Iterator<DocumentStepSubjectRight> oDocumentStepSubjectRightIterator = aDocumentStepSubjectRight_Source.iterator();
        while (oDocumentStepSubjectRightIterator.hasNext()) {
            DocumentStepSubjectRight oDocumentStepSubjectRight_Source = new DocumentStepSubjectRight();
            oDocumentStepSubjectRight_Source = oDocumentStepSubjectRightIterator.next();
            if (sKey_GroupPostfix.equals(oDocumentStepSubjectRight_Source.getsKey_GroupPostfix())) {
                oDocumentStepSubjectRight.setsKey_GroupPostfix(sKey_GroupPostfix_New);
                oDocumentStepSubjectRight.setbWrite(oDocumentStepSubjectRight_Source.getbWrite());
                Object sName = oDocumentStepSubjectRight_Source.getsName(); //oGroup.opt("sName");
                if (sName != null) {
                    oDocumentStepSubjectRight.setsName((String) sName);
                }

                //oDocumentStepSubjectRightDao.saveOrUpdate(oDocumentStepSubjectRight);

                //List<DocumentStepSubjectRightField> aDocumentStepSubjectRightField = mapToFields(oGroup, oDocumentStepSubjectRight);
                List<DocumentStepSubjectRightField> aDocumentStepSubjectRightField = new LinkedList();

                for (DocumentStepSubjectRightField oDocumentStepSubjectRightField_Source : oDocumentStepSubjectRight_Source.getDocumentStepSubjectRightFields()) {
                    DocumentStepSubjectRightField oDocumentStepSubjectRightField = new DocumentStepSubjectRightField();
                    oDocumentStepSubjectRightField.setbWrite(oDocumentStepSubjectRightField_Source.getbWrite());
                    oDocumentStepSubjectRightField.setsMask_FieldID(oDocumentStepSubjectRightField_Source.getsMask_FieldID());
                    oDocumentStepSubjectRightField.setDocumentStepSubjectRight(oDocumentStepSubjectRight);
                    //oDocumentStepSubjectRightField_Source.getsMask_FieldID();
                }

                oDocumentStepSubjectRight.setDocumentStepSubjectRightFields(aDocumentStepSubjectRightField);
                oDocumentStepSubjectRight.setDocumentStep(oDocumentStep_Active);
                LOG.info("right for step: {}", oDocumentStepSubjectRight);
                aDocumentStepSubjectRight_SourceNew.add(oDocumentStepSubjectRight);

                oDocumentStep_Active.setRights(aDocumentStepSubjectRight_SourceNew);

//                try{
                documentStepDao.saveOrUpdate(oDocumentStep_Active);
//                }catch(Exception ex){

//                }
            } else {
                LOG.info("sKey_GroupPostfix is not equal Key_GroupPostfix");
                LOG.info("sKey_GroupPostfix is: {}", sKey_GroupPostfix);
                LOG.info("Key_GroupPostfix is: {} ", oDocumentStepSubjectRight_Source.getsKey_GroupPostfix());
            }

        }
        return oDocumentStepSubjectRight;
    }

    private List<DocumentStepSubjectRightField> mapToFields(JSONObject group, DocumentStepSubjectRight rightForGroup) {
        List<DocumentStepSubjectRightField> resultFields = new ArrayList<>();
        String[] fieldNames = JSONObject.getNames(group);
        LOG.info("fields for right: {}", Arrays.toString(fieldNames));
        for (String fieldName : fieldNames) {
            if (fieldName == null || fieldName.equals("bWrite")) {
                continue;
            }
            if (fieldName.contains("Read")) {
                JSONArray masks = group.optJSONArray(fieldName);
                LOG.info("Read branch for masks: {}", masks);
                for (int i = 0; masks.length() > i; i++) {
                    String mask = masks.getString(i);
                    DocumentStepSubjectRightField field = new DocumentStepSubjectRightField();
                    field.setsMask_FieldID(mask);
                    field.setbWrite(false);
                    field.setDocumentStepSubjectRight(rightForGroup);
                    resultFields.add(field);
                }
            }
            if (fieldName.contains("Write")) {
                JSONArray masks = group.getJSONArray(fieldName);
                LOG.info("Write branch for masks: {}", masks);
                for (int i = 0; masks.length() > i; i++) {
                    String mask = masks.getString(i);
                    DocumentStepSubjectRightField field = new DocumentStepSubjectRightField();
                    field.setsMask_FieldID(mask);
                    field.setbWrite(true);
                    field.setDocumentStepSubjectRight(rightForGroup);
                    resultFields.add(field);
                }
            }
        }

        return resultFields;
    }

    public List<Map<String, Object>> getDocumentStepLogins(String snID_Process_Activiti) {//JSONObject //Map<String, Object>
        //assume that we can have only one active task per process at the same time
        LOG.info("snID_Process_Activiti={}", snID_Process_Activiti);
        List<Task> aTaskActive = oTaskService.createTaskQuery().processInstanceId(snID_Process_Activiti).active().list();
        if (aTaskActive.size() < 1 || aTaskActive.get(0) == null) {
            throw new IllegalArgumentException("Process with ID: " + snID_Process_Activiti + " has no active task.");
        }
        Task oTaskActive = aTaskActive.get(0);
        String sID_BP = oTaskActive.getProcessDefinitionId();
        LOG.info("sID_BP={}", sID_BP);
        if (sID_BP != null && sID_BP.contains(":")) {
            String[] as = sID_BP.split("\\:");
            sID_BP = as[0];
            LOG.info("FIX(:) sID_BP={}", sID_BP);
        }
        if (sID_BP != null && sID_BP.contains(".")) {
            String[] as = sID_BP.split("\\.");
            sID_BP = as[0];
            LOG.info("FIX(.) sID_BP={}", sID_BP);
        }

        ProcessInstance oProcessInstance = runtimeService
                .createProcessInstanceQuery()
                .processInstanceId(snID_Process_Activiti)
                .active()
                .singleResult();
        Map<String, Object> mProcessVariable = oProcessInstance.getProcessVariables();
        LOG.info("mProcessVariable={}", mProcessVariable);
        //Map<String, Object> mProcessVariable = new HashMap();
        String snID_Task = oTaskActive.getId();
        List<FormProperty> aProperty = oFormService.getTaskFormData(snID_Task).getFormProperties();
        for (FormProperty oProperty : aProperty) {
            mProcessVariable.put(oProperty.getId(), oProperty.getValue());
            //String sID = oProperty.getId();
        }
        LOG.info("mProcessVariable(added)={}", mProcessVariable);

        List<DocumentStep> aDocumentStep = documentStepDao.findAllBy("snID_Process_Activiti", snID_Process_Activiti);
        LOG.info("aDocumentStep={}", aDocumentStep);

        DocumentStep oDocumentStep_Common = aDocumentStep
                .stream()
                .filter(o -> o.getsKey_Step().equals("_"))
                .findAny()
                .orElse(null);
        LOG.info("oDocumentStep_Common={}", oDocumentStep_Common);

        String sKey_Step_Document = (String) mProcessVariable.get("sKey_Step_Document");
        if (StringUtils.isEmpty(sKey_Step_Document)) {
            //throw new IllegalStateException("There is no active Document Sep." +
            //        " Process variable sKey_Step_Document is empty.");
            //sKey_Step_Document="1";
        }
        DocumentStep oDocumentStep_Active = aDocumentStep
                .stream()
                .filter(o -> sKey_Step_Document == null ? o.getnOrder().equals(1) : o.getsKey_Step().equals(sKey_Step_Document))
                .findAny()
                .orElse(null);
        LOG.info("oDocumentStep_Active={}", oDocumentStep_Active);
        if (oDocumentStep_Active == null) {
            throw new IllegalStateException("There is no active Document Sep, process variable sKey_Step_Document="
                    + sKey_Step_Document);
        }

        //Map<String, Object> mReturn = new HashMap();
        List<Map<String, Object>> amReturn = new LinkedList();

        List<DocumentStepSubjectRight> aDocumentStepSubjectRight = new LinkedList();
        if (oDocumentStep_Common != null) {
            for (DocumentStepSubjectRight oDocumentStepSubjectRight : oDocumentStep_Common.getRights()) {
                aDocumentStepSubjectRight.add(oDocumentStepSubjectRight);
                //List<DocumentStepSubjectRight> aDocumentStepSubjectRight_Common
            }
        }
        for (DocumentStepSubjectRight oDocumentStepSubjectRight : oDocumentStep_Active.getRights()) {
            aDocumentStepSubjectRight.add(oDocumentStepSubjectRight);
            //List<DocumentStepSubjectRight> aDocumentStepSubjectRight_Common
        }

        final String sGroupPrefix = new StringBuilder(sID_BP).append("_").toString();

        for (DocumentStepSubjectRight oDocumentStepSubjectRight : aDocumentStepSubjectRight) {
            Map<String, Object> mParamDocumentStepSubjectRight = new HashMap();
            mParamDocumentStepSubjectRight.put("sDate", oDocumentStepSubjectRight.getsDate() == null ? "" : oDocumentStepSubjectRight.getsDate().toString());//"2016-05-15 12:12:34"
            mParamDocumentStepSubjectRight.put("bWrite", oDocumentStepSubjectRight.getbWrite());//false
            mParamDocumentStepSubjectRight.put("sName", oDocumentStepSubjectRight.getsName() == null ? "" : oDocumentStepSubjectRight.getsName());//"Главный контроллирующий"
            String sID_Group = new StringBuilder(sGroupPrefix).append(oDocumentStepSubjectRight.getsKey_GroupPostfix()).toString();
            List<User> aUser = oIdentityService.createUserQuery().memberOfGroup(sID_Group).list();
            LOG.info("sID_Group={}, aUser={}", sID_Group, aUser);
            List<Map<String, Object>> amUserProperty = new LinkedList();
            for (User oUser : aUser) {
                Map<String, Object> mUser = new HashMap();
                mUser.put("sLogin", oUser.getId());
                mUser.put("sFIO", oUser.getLastName() + "" + oUser.getFirstName());
                amUserProperty.add(mUser);
            }
            mParamDocumentStepSubjectRight.put("aUser", amUserProperty);
            LOG.info("amUserProperty={}", amUserProperty);
            String sLogin = oDocumentStepSubjectRight.getsLogin();
            LOG.info("sLogin={}", sLogin);
            if (sLogin != null) {
                User oUser = oIdentityService.createUserQuery().userId(sLogin).singleResult();
                mParamDocumentStepSubjectRight.put("sLogin", oUser.getId());
                mParamDocumentStepSubjectRight.put("sFIO", oUser.getLastName() + "" + oUser.getFirstName());
                //mReturn.put(sLogin, mParamDocumentStepSubjectRight);
            }
            LOG.info("mParamDocumentStepSubjectRight={}", mParamDocumentStepSubjectRight);
            amReturn.add(mParamDocumentStepSubjectRight);
        }
        //LOG.info("mReturn={}", mReturn);
        LOG.info("amReturn={}", amReturn);

        return amReturn;//mReturn
    }

    /*public DocumentStep oDocumentStep_Active(String snID_Process_Activiti){
        return oDocumentStep_Active;
    }*/
    public Map<String, Object> getDocumentStepRights(String sLogin, String snID_Process_Activiti) {//JSONObject
        //assume that we can have only one active task per process at the same time

        long startTime = System.nanoTime();

        LOG.info("sLogin={}, snID_Process_Activiti={}", sLogin, snID_Process_Activiti);
        List<Task> aTaskActive = oTaskService.createTaskQuery().processInstanceId(snID_Process_Activiti).active().list();
        if (aTaskActive.size() < 1 || aTaskActive.get(0) == null) {
            throw new IllegalArgumentException("Process with ID: " + snID_Process_Activiti + " has no active task.");
        }
        Task oTaskActive = aTaskActive.get(0);
        String sID_BP = oTaskActive.getProcessDefinitionId();
        LOG.info("sID_BP={}", sID_BP);
        if (sID_BP != null && sID_BP.contains(":")) {
            String[] as = sID_BP.split("\\:");
            sID_BP = as[0];
            LOG.info("FIX(:) sID_BP={}", sID_BP);
        }
        if (sID_BP != null && sID_BP.contains(".")) {
            String[] as = sID_BP.split("\\.");
            sID_BP = as[0];
            LOG.info("FIX(.) sID_BP={}", sID_BP);
        }

        ProcessInstance oProcessInstance = runtimeService
                .createProcessInstanceQuery()
                .processInstanceId(snID_Process_Activiti)
                .active()
                .singleResult();
        Map<String, Object> mProcessVariable = oProcessInstance.getProcessVariables();
        LOG.info("mProcessVariable={}", mProcessVariable);
        //Map<String, Object> mProcessVariable = new HashMap();
        String snID_Task = oTaskActive.getId();
        List<FormProperty> aProperty = oFormService.getTaskFormData(snID_Task).getFormProperties();
        for (FormProperty oProperty : aProperty) {
            mProcessVariable.put(oProperty.getId(), oProperty.getValue());
            //String sID = oProperty.getId();
        }
        LOG.info("mProcessVariable(added)={}", mProcessVariable);

        List<DocumentStep> aDocumentStep = documentStepDao.findAllBy("snID_Process_Activiti", snID_Process_Activiti);
        LOG.info("aDocumentStep={}", aDocumentStep);

        DocumentStep oDocumentStep_Common = aDocumentStep
                .stream()
                .filter(o -> o.getsKey_Step().equals("_"))
                .findAny()
                .orElse(null);
        LOG.info("oDocumentStep_Common={}", oDocumentStep_Common);

        String sKey_Step_Document = (String) mProcessVariable.get("sKey_Step_Document");
        if (StringUtils.isEmpty(sKey_Step_Document)) {
            //throw new IllegalStateException("There is no active Document Sep." +
            //        " Process variable sKey_Step_Document is empty.");
            //sKey_Step_Document="1";
        }
        DocumentStep oDocumentStep_Active = aDocumentStep
                .stream()
                .filter(o -> sKey_Step_Document == null ? o.getnOrder().equals(1) : o.getsKey_Step().equals(sKey_Step_Document))
                .findAny()
                .orElse(null);
        LOG.info("oDocumentStep_Active={}", oDocumentStep_Active);
        if (oDocumentStep_Active == null) {
            throw new IllegalStateException("There is no active Document Step, process variable sKey_Step_Document="
                    + sKey_Step_Document);
        }

        //DocumentStep = oDocumentStep_Active = oDocumentStep_Active(snID_Process_Activiti);
        List<Group> aGroup = identityService.createGroupQuery().groupMember(sLogin).list();
        Set<String> asID_Group = new HashSet<>();
        if (aGroup != null) {
            aGroup.stream().forEach(group -> asID_Group.add(group.getId()));
        }
        LOG.info("sLogin={}, asID_Group={}", sLogin, asID_Group);
        //Lets collect DocumentStepSubjectRight by according users groups

        //final String sGroupPrefix = new StringBuilder(sID_BP).append("_").toString();
        long stopTime = System.nanoTime();

        LOG.info("getDocumentStepRights 1st block time execution is: " + String.format("%,12d", (stopTime - startTime)));

        startTime = System.nanoTime();

        List<DocumentStepSubjectRight> aDocumentStepSubjectRight_Common = new LinkedList();
        if (oDocumentStep_Common != null) {
            aDocumentStepSubjectRight_Common = oDocumentStep_Common
                    .getRights()
                    .stream()
                    //.filter(o -> asID_Group.contains(new StringBuilder(sGroupPrefix).append(o.getsKey_GroupPostfix()).toString()))
                    .filter(oRight -> asID_Group.contains(oRight.getsKey_GroupPostfix()))
                    .collect(Collectors.toList());
        }

        LOG.info("aDocumentStepSubjectRight_Common={}", aDocumentStepSubjectRight_Common);

        List<DocumentStepSubjectRight> aDocumentStepSubjectRight_Active = oDocumentStep_Active
                .getRights()
                .stream()
                //.filter(o -> asID_Group.contains(new StringBuilder(sGroupPrefix).append(o.getsKey_GroupPostfix()).toString()))
                .filter(o -> asID_Group.contains(o.getsKey_GroupPostfix()))
                .collect(Collectors.toList());
        LOG.info("aDocumentStepSubjectRight_Active={}", aDocumentStepSubjectRight_Active);

        List<DocumentStepSubjectRight> aDocumentStepSubjectRight = aDocumentStepSubjectRight_Common;
        aDocumentStepSubjectRight.addAll(aDocumentStepSubjectRight_Active);
        LOG.info("aDocumentStepSubjectRight={}", aDocumentStepSubjectRight);

        Map<String, Object> mReturn = new HashMap();

        Boolean bWrite = null;
        for (DocumentStepSubjectRight oDocumentStepSubjectRight : aDocumentStepSubjectRight) {
            if (bWrite == null) {
                bWrite = false;
            }
            bWrite = bWrite || oDocumentStepSubjectRight.getbWrite();
        }
        mReturn.put("bWrite", bWrite);
        LOG.info("bWrite={}", bWrite);

        List<String> asID_Field_Read = new LinkedList();
        List<String> asID_Field_Write = new LinkedList();

        List<FormProperty> aFormProperty = oFormService.getTaskFormData(snID_Task).getFormProperties();

        stopTime = System.nanoTime();

        LOG.info("getDocumentStepRights 2nd block time execution is: " + String.format("%,12d", (stopTime - startTime)));
        startTime = System.nanoTime();
        LOG.info("total FormProperty size is: " + aFormProperty.size());
        LOG.info("total aDocumentStepSubjectRight size is: " + aDocumentStepSubjectRight.size());

        Map<String, boolean[]> resultMap = new HashMap<>();

        for (FormProperty oProperty : aFormProperty) {
            groupSearch:
            {
                for (DocumentStepSubjectRight oDocumentStepSubjectRight : aDocumentStepSubjectRight) {
                    List<String> asID_Field_Read_Temp = new LinkedList();
                    List<String> asID_Field_Write_Temp = new LinkedList();
                    //Boolean bInclude=null;
                    LOG.info("oDocumentStepSubjectRight.getsKey_GroupPostfix()={}", oDocumentStepSubjectRight.getsKey_GroupPostfix());

                    long loopStartTime = System.nanoTime();

                    for (DocumentStepSubjectRightField oDocumentStepSubjectRightField : oDocumentStepSubjectRight.getDocumentStepSubjectRightFields()) {
                        String sMask = oDocumentStepSubjectRightField.getsMask_FieldID();
                        LOG.info("sMask={}", sMask);
                        LOG.info("total DocumentStepSubjectRightFields size is: " + oDocumentStepSubjectRight.getDocumentStepSubjectRightFields().size());
                        if (sMask != null) {
                            Boolean bNot = false;
                            if (sMask.startsWith("!")) {
                                bNot = true;
                                sMask = sMask.substring(1);
                            }
                            Boolean bEndsWith = false;
                            Boolean bStartWith = false;
                            Boolean bAll = "*".equals(sMask);
                            if (!bAll) {
                                if (sMask.startsWith("*")) {
                                    bEndsWith = true;
                                    sMask = sMask.substring(1);
                                }
                                if (sMask.endsWith("*")) {
                                    bStartWith = true;
                                    sMask = sMask.substring(0, sMask.length() - 1);
                                }
                            }
                            LOG.info("bEndsWith={},bStartWith={},bAll={},bNot={}", bEndsWith, bStartWith, bAll, bNot);
                            long scLoopStartTime = System.nanoTime();

                            //for (FormProperty oProperty : aFormProperty) {
                            String sID = oProperty.getId();
                            Boolean bFound = false;
                            if (bStartWith && bEndsWith) {
                                bFound = sID.contains(sMask);
                            } else if (bStartWith) {
                                bFound = sID.startsWith(sMask);
                            } else if (bEndsWith) {
                                bFound = sID.endsWith(sMask);
                            }

                            LOG.info("sID={},bFound={},bAll={}", sID, bFound, bAll);
                            if (bAll || bFound) {
                                Boolean bWriteField = oDocumentStepSubjectRightField.getbWrite();
                                if (bNot) {
                                    /*if (bWriteField) {
                                        asID_Field_Write_Temp.remove(sID);
                                    } else {
                                        asID_Field_Read_Temp.remove(sID);
                                    }*/
                                    resultMap.remove(sID);
                                } else if (bWriteField) {
                                    //asID_Field_Write_Temp.add(sID);
                                    if (resultMap.containsKey(sID)) {
                                        resultMap.replace(sID, new boolean[]{true, false});
                                    } else {
                                        resultMap.put(sID, new boolean[]{true, false});
                                    }

                                    break groupSearch;

                                } else {
                                    resultMap.put(sID, new boolean[]{false, true});
                                }
                                LOG.info("bWriteField={}", bWriteField);
                            }
                            //}

                            long scLoopStopTime = System.nanoTime();
                            LOG.info("2st loop time execution in getDocumentStepRights 3th block is: " + String.format("%,12d", (scLoopStopTime - scLoopStartTime)));
                        }
                    }

                    long loopStopTime = System.nanoTime();
                    LOG.info("1st loop time execution in getDocumentStepRights 3th block is: " + String.format("%,12d", (loopStopTime - loopStartTime)));

                    /*asID_Field_Read.addAll(asID_Field_Read_Temp);
                    asID_Field_Write.addAll(asID_Field_Write_Temp);

                    LOG.info("asID_Field_Write_TMP={}", asID_Field_Read_Temp);
                    LOG.info("asID_Field_Read_TMP={}", asID_Field_Write_Temp);
                    LOG.info("asID_Field_Write_TMP size={}", asID_Field_Read_Temp.size());
                    LOG.info("asID_Field_Read_TMP size={}", asID_Field_Write_Temp.size()); */
                }
            }
        }

        stopTime = System.nanoTime();

        LOG.info("getDocumentStepRights 3th block time execution is: " + String.format("%,12d", (stopTime - startTime)));
        startTime = System.nanoTime();
        //mReturn.put("asID_Field_Write(0)", asID_Field_Write);
        //mReturn.put("asID_Field_Read(0)", asID_Field_Read);
        LOG.info("asID_Field_Write(before)={}", asID_Field_Write);
        LOG.info("asID_Field_Read(before)={}", asID_Field_Read);
        LOG.info("asID_Field_Write(before) size={}", asID_Field_Write.size());
        LOG.info("asID_Field_Read(before) size={}", asID_Field_Read.size());

        TreeSet<String> asUnique_ID_Field_Write = new TreeSet<>(asID_Field_Write);
        TreeSet<String> asUnique_ID_Field_Read = new TreeSet<>(asID_Field_Read);

        LOG.info("asUnique_ID_Field_Write ={}", asUnique_ID_Field_Write);
        LOG.info("asUnique_ID_Field_Write ={}", asUnique_ID_Field_Read);
        LOG.info("asID_Field_Write size={}", asUnique_ID_Field_Write.size());
        LOG.info("asID_Field_Read size={}", asUnique_ID_Field_Read.size());

        /*for (String sID_Field_Write : asID_Field_Write) {
            asID_Field_Read.remove(sID_Field_Write);
        }
        
        mReturn.put("asID_Field_Write", asID_Field_Write);
        mReturn.put("asID_Field_Read", asID_Field_Read);*/
        List<String> asNewID_Field_Read = new LinkedList();
        List<String> asNewID_Field_Write = new LinkedList();

        for (String key : resultMap.keySet()) {
            boolean[] resultArray = resultMap.get(key);
            if (resultArray[0]) {
                asNewID_Field_Write.add(key);
            } else {
                asNewID_Field_Read.add(key);
            }
        }

        mReturn.put("asID_Field_Write", asNewID_Field_Write);
        mReturn.put("asID_Field_Read", asNewID_Field_Read);

        LOG.info("asNewID_Field_Write = {}", asID_Field_Write);
        LOG.info("asNewID_Field_Read ={}", asID_Field_Read);

        LOG.info("asID_Field_Write(after)={}", asID_Field_Write);
        LOG.info("asID_Field_Read(after)={}", asID_Field_Read);
        //LOG.info("mReturn={}", mReturn);
        stopTime = System.nanoTime();
        LOG.info("getDocumentStepRights 4th block time execution is: " + String.format("%,12d", (stopTime - startTime)));

        return mReturn;
    }

    public void syncDocumentGroups(DelegateTask delegateTask, List<DocumentStep> aDocumentStep) {

        Set<String> asGroup = new HashSet<>();
        for (DocumentStep oDocumentStep : aDocumentStep) {
            List<DocumentStepSubjectRight> aDocumentStepSubjectRight = oDocumentStep.getRights();
            if (aDocumentStepSubjectRight != null) {

                for (DocumentStepSubjectRight oDocumentStepSubjectRight : aDocumentStepSubjectRight) {
                    asGroup.add(oDocumentStepSubjectRight.getsKey_GroupPostfix());
                }
            }
        }
        LOG.info("asGroup in DocumentInit_iDoc {}", asGroup);

        Set<String> asGroup_Old = new HashSet<>();
        Set<IdentityLink> groupsOld = delegateTask.getCandidates();
        groupsOld.stream().forEach((groupOld) -> {
            asGroup_Old.add(groupOld.getGroupId());
        });
        LOG.info("asGroup_Old before setting: {}", asGroup_Old);

        delegateTask.addCandidateGroups(asGroup);
        
        Set<String> asGroup_New = new HashSet<>();
        Set<IdentityLink> groupsNew = delegateTask.getCandidates();
        groupsNew.stream().forEach((groupNew) -> {
            asGroup_New.add(groupNew.getGroupId());
        });
        LOG.info("asGroup_New after setting: {}", asGroup_New);
    }

    //public void checkDocumentInit(DelegateExecution execution) throws IOException, URISyntaxException {//JSONObject
    public List<DocumentStep> checkDocumentInit(DelegateExecution execution) throws IOException, URISyntaxException {
        //assume that we can have only one active task per process at the same time
        String snID_Process_Activiti = execution.getId();
        List<DocumentStep> aResDocumentStep = new ArrayList<>();
        LOG.info("snID_Process_Activiti={}", snID_Process_Activiti);
        String sID_BP = execution.getProcessDefinitionId();
        LOG.info("sID_BP={}", sID_BP);
        if (sID_BP != null && sID_BP.contains(":")) {
            String[] as = sID_BP.split("\\:");
            sID_BP = as[0];
            LOG.info("FIX(:) sID_BP={}", sID_BP);
        }
        if (sID_BP != null && sID_BP.contains(".")) {
            String[] as = sID_BP.split("\\.");
            sID_BP = as[0];
            LOG.info("FIX(.) sID_BP={}", sID_BP);
        }

        Map<String, Object> mProcessVariable = execution.getVariables();
        String sKey_Step_Document = mProcessVariable.containsKey("sKey_Step_Document") ? (String) mProcessVariable.get("sKey_Step_Document") : null;
        if ("".equals(sKey_Step_Document)) {
            sKey_Step_Document = null;
        }
        LOG.info("BEFORE:sKey_Step_Document={}", sKey_Step_Document);

        if (sKey_Step_Document == null) {

            String sPath = "document/" + sID_BP + ".json";
            LOG.info("sPath={}", sPath);
            byte[] aByteDocument = getFileData_Pattern(sPath);
            if (aByteDocument != null && aByteDocument.length > 0) {
                String soJSON = null;
                soJSON = Tool.sData(aByteDocument);
                LOG.info("soJSON={}", soJSON);

                //setDocumentSteps(snID_Process_Activiti, soJSON);
                aResDocumentStep = setDocumentSteps(snID_Process_Activiti, soJSON);
                List<DocumentStep> aDocumentStep = documentStepDao.findAllBy("snID_Process_Activiti", snID_Process_Activiti);
                LOG.info("aDocumentStep={}", aDocumentStep);

                if (aDocumentStep.size() > 1) {
                    DocumentStep oDocumentStep = aDocumentStep.get(1);
                    sKey_Step_Document = oDocumentStep.getsKey_Step();
                } else if (aDocumentStep.size() > 0) {
                    DocumentStep oDocumentStep = aDocumentStep.get(0);
                    sKey_Step_Document = oDocumentStep.getsKey_Step();
                    //sKey_Step_Document = aDocumentStep.get(0);
                } else {
                    sKey_Step_Document = "_";
                }

                LOG.info("AFTER:sKey_Step_Document={}", sKey_Step_Document);
                LOG.info("snID_Process_Activiti={}", snID_Process_Activiti);
                runtimeService.setVariable(snID_Process_Activiti, "sKey_Step_Document", sKey_Step_Document);
            }
        }
        return aResDocumentStep;
    }

//3.4) setDocumentStep(snID_Process_Activiti, bNext) //проставить номер шаг (bNext=true > +1 иначе -1) в поле таски с id=sKey_Step_Document    
    public String setDocumentStep(String snID_Process_Activiti, String sKey_Step) throws Exception {//JSONObject
        //assume that we can have only one active task per process at the same time
        LOG.info("sKey_Step={}, snID_Process_Activiti={}", sKey_Step, snID_Process_Activiti);
        HistoricProcessInstance oProcessInstance = historyService
                .createHistoricProcessInstanceQuery()
                .processInstanceId(snID_Process_Activiti.trim())
                .includeProcessVariables()
                .singleResult();
        if (oProcessInstance != null) {
            Map<String, Object> mProcessVariable = oProcessInstance.getProcessVariables();
            //Map<String, Object> mProcessVariable = new HashMap();
            /*List<FormProperty> a = oFormService.getTaskFormData(snID_Task).getFormProperties();                    
            for (FormProperty oProperty : a) {
                mProcessVariable.put(oProperty.getId(), oProperty.getValue());
                //String sID = oProperty.getId();
            }*/

            String sKey_Step_Document = mProcessVariable.containsKey("sKey_Step_Document") ? (String) mProcessVariable.get("sKey_Step_Document") : null;
            if ("".equals(sKey_Step_Document)) {
                sKey_Step_Document = null;
            }

            if (sKey_Step_Document == null) {
                sKey_Step_Document = (String) runtimeService.getVariable(snID_Process_Activiti, "sKey_Step_Document");
            }

            LOG.debug("BEFORE:sKey_Step_Document={}", sKey_Step_Document);

            List<DocumentStep> aDocumentStep = documentStepDao.findAllBy("snID_Process_Activiti", snID_Process_Activiti);
            LOG.debug("aDocumentStep={}", aDocumentStep);

            if (sKey_Step != null) {
                sKey_Step_Document = sKey_Step;
            } else if (sKey_Step_Document == null) {
                if (aDocumentStep.size() > 1) {
                    aDocumentStep.get(1);
                } else if (aDocumentStep.size() > 0) {
                    aDocumentStep.get(0);
                } else {
                }
            } else {
                Long nOrder = null;
                for (DocumentStep oDocumentStep : aDocumentStep) {
                    if (nOrder != null) {
                        sKey_Step_Document = oDocumentStep.getsKey_Step();
                        break;
                    }
                    if (nOrder == null && sKey_Step_Document.equals(oDocumentStep.getsKey_Step())) {
                        nOrder = oDocumentStep.getnOrder();
                    }
                }
            }

            LOG.debug("AFTER:sKey_Step_Document={}", sKey_Step_Document);
            runtimeService.setVariable(snID_Process_Activiti, "sKey_Step_Document", sKey_Step_Document);
            //oProcessInstance.setProcessVariables();
            //runtimeService.set
            /*
            ProcessInstance oProcessInstance = runtimeService
                .createProcessInstanceQuery()
                .processInstanceId(snID_Process_Activiti)
                .active()
                .singleResult();
            Map<String, Object> mProcessVariable = oProcessInstance.getProcessVariables();
             */

        } else {
            throw new Exception("oProcessInstance is null snID_Process_Activiti = " + snID_Process_Activiti);
        }

        return "";
    }

    public Map<String, Boolean> isDocumentStepSubmitedAll(String nID_Process, String sLogin, String sKey_Step)
            throws ParseException, RecordInmemoryException, IOException, ClassNotFoundException, CRCInvalidException,
            RecordNotFoundException {
        Map<String, Boolean> mReturn = new HashMap();

        List<DocumentStep> aDocumentStep = ((DocumentStepDao) documentStepDao).getStepForProcess(nID_Process);
        LOG.info("The size of list" + (aDocumentStep != null ? aDocumentStep.size() : null));
        // LOG.info("Result list of steps: {}", aDocumentStep);

        DocumentStep oFindedDocumentStep = null;

        for (DocumentStep oDocumentStep : aDocumentStep) {
            if (oDocumentStep.getsKey_Step().equals(sKey_Step)) {
                oFindedDocumentStep = oDocumentStep;
                break;
            }
        }

        List<DocumentStepSubjectRight> aDocumentStepSubjectRight = new ArrayList<>();

        if (oFindedDocumentStep != null) {
            aDocumentStepSubjectRight.addAll(oFindedDocumentStep.getRights());
            LOG.info("oFindedDocumentStep ={}", oFindedDocumentStep.getRights());
        }

        boolean check = true;

        for (DocumentStepSubjectRight oDocumentStepSubjectRight : aDocumentStepSubjectRight) {

            if (oDocumentStepSubjectRight != null) {
                boolean bNeedECP = false;
                if (oDocumentStepSubjectRight.getbNeedECP() != null) {
                    bNeedECP = oDocumentStepSubjectRight.getbNeedECP();
                }

                DateTime sDateECP = oDocumentStepSubjectRight.getsDateECP();
                LOG.info("sDateECP =", oDocumentStepSubjectRight.getsDateECP());

                if (bNeedECP && sDateECP == null) {
                    check = false;
                    break;
                }

            }
        }
        if (check) {
            mReturn.put("bSigned:", true);
        } else {
            mReturn.put("bSigned:", false);
        }
        return mReturn;
    }
}
