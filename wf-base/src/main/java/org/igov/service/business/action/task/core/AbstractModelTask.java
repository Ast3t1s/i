package org.igov.service.business.action.task.core;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.common.base.Charsets;
import org.activiti.engine.ActivitiException;
import org.activiti.engine.RuntimeService;
import org.activiti.engine.TaskService;
import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.DelegateTask;
import org.activiti.engine.delegate.Expression;
import org.activiti.engine.form.FormData;
import org.activiti.engine.form.FormProperty;
import org.activiti.engine.task.Attachment;
import org.apache.commons.codec.binary.Base64;
import org.igov.io.GeneralConfig;
import org.igov.io.Log;
import org.igov.io.db.kv.temp.IBytesDataInmemoryStorage;
import org.igov.io.db.kv.temp.model.ByteArrayMultipartFile;
import org.igov.model.action.task.core.entity.ListKeyable;
import org.igov.model.flow.FlowSlotDao;
import org.igov.model.flow.FlowSlotTicket;
import org.igov.model.flow.FlowSlotTicketDao;
import org.igov.service.business.action.task.form.FormFileType;
import org.igov.service.business.action.task.form.QueueDataFormType;
import org.igov.service.business.action.task.form.TableFormType;
import org.igov.service.business.flow.slot.SaveFlowSlotTicketResponse;
import org.igov.util.JSON.JsonRestUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.igov.util.VariableMultipartFile;

import java.io.*;
import java.nio.charset.Charset;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.logging.Level;
import org.apache.commons.io.IOUtils;
import org.igov.io.db.kv.statical.IBytesDataStorage;
import org.igov.io.db.kv.temp.exception.RecordInmemoryException;
import org.igov.model.action.vo.TaskAttachVO;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.igov.service.business.object.ObjectFileService;
import org.igov.service.conf.AttachmetService;
import org.igov.service.exception.CRCInvalidException;
import org.igov.service.exception.RecordNotFoundException;
import org.json.simple.JSONArray;
import static org.igov.util.Tool.sTextTranslit;

public abstract class AbstractModelTask {

    public static final String LIST_KEY_PREFIX = "lst";
    public static final String LIST_KEY_DELIM = ":";
    private static Logger LOG = LoggerFactory
            .getLogger(AbstractModelTask.class);

    @Autowired
    protected FlowSlotDao flowSlotDao;
    @Autowired
    protected FlowSlotTicketDao oFlowSlotTicketDao;
    @Autowired
    private IBytesDataInmemoryStorage oBytesDataInmemoryStorage;
    @Autowired
    public TaskService taskService;
    /*@Autowired
    private ObjectFileService oObjectFileService;
    
    @Autowired
    private IBytesDataStorage oBytesDataStaticStorage;*/
    
    @Autowired
    protected AttachmetService oAttachmetService;
    
    @Autowired
    GeneralConfig generalConfig;
    
    @Autowired
    private RuntimeService oRuntimeService;

    /**
     * Возвращает сложный ключ переменной бизнес-процесса
     *
     * @param listKey
     * @param elementKey
     * @return
     */
    private static String getExecutionVarKey(String listKey, String elementKey) {
        return new StringBuilder().append(LIST_KEY_PREFIX)
                .append(LIST_KEY_DELIM)
                .append(listKey)
                .append(LIST_KEY_DELIM)
                .append(elementKey).toString();
    }

    /**
     * Конверт Byte To String
     *
     * @param contentBytes
     * @return
     */
    public static String contentByteToString(byte[] contentBytes) {
        return Base64.encodeBase64String(contentBytes);
    }

    /**
     * Конверт String to Byte
     *
     * @param contentString
     * @return
     * @throws java.io.IOException
     */
    public static byte[] contentStringToByte(String contentString) throws IOException {
        return Base64.decodeBase64(contentString);
    }

    public static String getStringFromFieldExpression(Expression expression,
            DelegateExecution execution) {
        if (expression != null) {
            Object value = expression.getValue(execution);
            if (value != null) {
                return value.toString();
            }
        }
        return null;
    }

    /**
     * Получить
     *
     * @param keyRedis
     * @return
     */
    public static List<String> getListKeysRedis(String keyRedis) {
        List<String> listKeys = new ArrayList<String>();
        if (keyRedis != null && !keyRedis.isEmpty()) {
            String[] keys = keyRedis.split(";");
            listKeys = Arrays.asList(keys);
            return listKeys;
        }
        return listKeys;
    }

    public static List<String> getVariableValues(DelegateExecution execution, List<String> formFieldIds) {
        return getVariableValues(execution.getEngineServices().getRuntimeService(), execution.getProcessInstanceId(),
                formFieldIds);
    }

    public static FormProperty getField(FormData oFormData, String sID) {
        List<FormProperty> aFormProperty = oFormData.getFormProperties();
        if (!aFormProperty.isEmpty()) {
            for (FormProperty oFormProperty : aFormProperty) {
                if (sID.equals(oFormProperty.getId())) {
                    return oFormProperty;
                }
            }
        }
        return null;
    }

    public static String getVariableValue(DelegateExecution execution, String sID) {
        RuntimeService runtimeService = execution.getEngineServices().getRuntimeService();
        if (runtimeService != null) {
            Map<String, Object> variables = runtimeService.getVariables(execution.getProcessInstanceId());
            if (variables != null) {
                if (variables.containsKey(sID)) {
                    return String.valueOf(variables.get(sID));
                }
            }
        }
        return null;
    }

    public static List<String> getVariableValues(RuntimeService runtimeService, String processInstanceId,
            List<String> formFieldIds) {
        List<String> listValueKeys = new ArrayList<String>();
        if (!formFieldIds.isEmpty()) {
            Map<String, Object> variables = runtimeService.getVariables(
                    processInstanceId);
            for (String fieldId : formFieldIds) {
                if (variables.containsKey(fieldId)) {
                    listValueKeys.add(String.valueOf(variables.get(fieldId)));
                }
            }
        }
        return listValueKeys;
    }

    /**
     * Получить ид поля с кастомным типом file или table
     *
     * @param oFormData
     * @return
     */
    public static List<String> getListFieldCastomTypeFile(FormData oFormData) {
        List<String> asFieldID = new ArrayList<String>();
        List<FormProperty> aFormProperty = oFormData.getFormProperties();
        if (!aFormProperty.isEmpty()) {
            for (FormProperty oFormProperty : aFormProperty) {
                if (oFormProperty.getType() instanceof FormFileType || oFormProperty.getType() instanceof TableFormType) {
                    asFieldID.add(oFormProperty.getId());
                }
            }
        }
        return asFieldID;
    }
    
    /**
     * @param oFormData form data of process
     * @return variable ids with custom property type QueueDataFormType
     */
    public static List<String> getListField_QueueDataFormType(FormData oFormData) {
        List<String> asFieldID = new ArrayList<String>();
        List<FormProperty> aFormProperty = oFormData.getFormProperties();
        if (!aFormProperty.isEmpty()) {
            for (FormProperty oFormProperty : aFormProperty) {
                if (oFormProperty.getType() instanceof QueueDataFormType) {
                    asFieldID.add(oFormProperty.getId());
                }
            }
        }
        return asFieldID;
    }

    /**
     * Получить имя поля
     *
     * @param oFormData
     * @return
     */
    public static List<String> getListCastomFieldName(FormData oFormData) {
        List<String> filedName = new ArrayList<String>();
        List<FormProperty> aFormProperty = oFormData.getFormProperties();
        if (!aFormProperty.isEmpty()) {
            for (FormProperty oFormProperty : aFormProperty) {
                if (oFormProperty.getType() instanceof FormFileType || oFormProperty.getType() instanceof TableFormType) {
                    filedName.add(oFormProperty.getName());
                }
            }
        }
        return filedName;
    }

    public static String getCastomFieldValue(FormData oFormData, String sFieldName) {
        List<FormProperty> aFormProperty = oFormData.getFormProperties();
        if (!aFormProperty.isEmpty()) {
            for (FormProperty oFormProperty : aFormProperty) {
                //if (oFormProperty.getType() instanceof FormFileType && oFormProperty.getName().equalsIgnoreCase(fieldName)) {
                if (oFormProperty.getName().equalsIgnoreCase(sFieldName)) {
                    return oFormProperty.getValue() != null ? oFormProperty.getValue() : "";
                }
            }
        }
        return "";
    }

    public static ByteArrayOutputStream multipartFileToByteArray(MultipartFile file) throws IOException {
        return multipartFileToByteArray(file, null);
    }

    /**
     * multipartFile To ByteArray
     *
     * @param oMultipartFile
     * @return
     * @throws java.io.IOException
     */
    public static ByteArrayOutputStream multipartFileToByteArray(MultipartFile oMultipartFile, String sFileNameReal)
            throws IOException {

        LOG.debug("(sFileNameReal={})", sFileNameReal);

        //String sFilename = new String(file.getOriginalFilename().getBytes(), "Cp1251");//UTF-8
        //LOG.debug("(sFilename={})", sFilename);
        String sFilenameEncoded = new String(oMultipartFile.getOriginalFilename().getBytes(Charset.forName("UTF-8")));//UTF-8
        LOG.debug("(sFilenameEncoded={})", sFilenameEncoded);
        ByteArrayMultipartFile oByteArrayMultipartFile = new ByteArrayMultipartFile(
                oMultipartFile.getBytes(), oMultipartFile.getName(), sFileNameReal == null ? sFilenameEncoded : sFileNameReal,
                oMultipartFile.getContentType());
        ByteArrayOutputStream oByteArrayOutputStream = new ByteArrayOutputStream();
        ObjectOutputStream oObjectOutputStream = new ObjectOutputStream(oByteArrayOutputStream);
        oObjectOutputStream.writeObject(oByteArrayMultipartFile);
        oObjectOutputStream.flush();
        oObjectOutputStream.close();
        return oByteArrayOutputStream;
    }

    /**
     * ByteArray To multipartFile
     *
     * @param byteFile
     * @return
     * @throws java.io.IOException
     * @throws ClassNotFoundException
     */
    public static ByteArrayMultipartFile getByteArrayMultipartFileFromStorageInmemory(
            byte[] byteFile) throws IOException, ClassNotFoundException {
        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(byteFile);
        ObjectInputStream ois = new ObjectInputStream(byteArrayInputStream);
        ByteArrayMultipartFile contentMultipartFile = (ByteArrayMultipartFile) ois.readObject();
        ois.close();
        return contentMultipartFile;
    }

    /**
     * Получить список по ключу списка из execution
     *
     * @param listKey
     * @param execution
     * @return
     */
    @SuppressWarnings("unchecked")
    public <T> List<T> getListVariable(String listKey, DelegateExecution execution) {
        List<T> result = new ArrayList<T>();

        String keyPrefix = LIST_KEY_PREFIX + LIST_KEY_DELIM + listKey;

        for (String execVarKey : execution.getVariableNames()) {
            if (execVarKey.startsWith(keyPrefix)) {
                result.add((T) execution.getVariable(execVarKey));
            }
        }
        return result;
    }

    /**
     * Сохранить список обьектов в execution
     *
     * @param listKey
     * @param list
     * @param execution
     */
    public <T extends ListKeyable> void setListVariable(String listKey, List<T> list, DelegateExecution execution) {
        for (ListKeyable listKeyable : list) {
            execution.setVariable(
                    getExecutionVarKey(listKey, listKeyable.getKey()),
                    listKeyable);
        }
    }
    
    public void addNewAttachmentToTask(DelegateExecution oExecution, JSONObject oJsonTaskAttachVO, String sFieldID) {

        LOG.info("oJsonTaskAttachVO instanceof TaskAttachVO)");
        LOG.info("oJsonTaskAttachVO sID_StorageType: " + oJsonTaskAttachVO.get("sID_StorageType"));
        MultipartFile oMultipartFile = null;

        try {
            oMultipartFile = oAttachmetService
                    .getAttachment(oExecution.getProcessInstanceId(), sFieldID, null, null);
        } catch (ParseException | RecordInmemoryException | IOException | ClassNotFoundException|CRCInvalidException|RecordNotFoundException ex) {
            LOG.info("getAttachment has some errors: " + ex);
        }

        if (oMultipartFile != null) {
            try {
                JSONArray aJSONAttribute = (JSONArray) oJsonTaskAttachVO.get("aAttribute");
                List<Map<String, Object>> aAttribute = new ArrayList<>();

                if (!aJSONAttribute.isEmpty()) {
                    for (Object oAttributeElem : aJSONAttribute) {
                        Map<String, Object> mParam = new HashMap<>();
                        mParam.put((String) ((JSONObject) oAttributeElem).get("sID"), ((JSONObject) oAttributeElem).get("sValue"));
                        aAttribute.add(mParam);
                    }
                }

                byte[] aByteFile = oMultipartFile.getBytes();
                    oAttachmetService.createAttachment(oExecution.getProcessInstanceId(), sFieldID,
                            (String) oJsonTaskAttachVO.get("sFileNameAndExt"),
                            (boolean) oJsonTaskAttachVO.get("bSigned"), "Mongo", "text/html",
                            aAttribute, aByteFile, true);

            } catch (IOException|CRCInvalidException|RecordNotFoundException ex) {
                LOG.info("createAttachment has some errors: " + ex);
            }
        } else {
            LOG.info("oVariableMultipartFile is null");
        }
    }

    public List<Attachment> addOldAttachmentToTask(DelegateTask oTask, DelegateExecution oExecution, FormData oFormData, String sFieldValue,
            List<Attachment> aAttachment, String sCurrFieldID, String sCurrFieldName) {

        String sID_Field = sCurrFieldID;
        LOG.info("(sID_Field={})", sID_Field);

        //String sDescription = asFieldName.get((asFieldName.size() - 1) - n);
        String sDescription = sCurrFieldName;
        if (sDescription != null && sDescription.contains(";")) {
            //LOG.info("BEFORE:(sDescription={})", sDescription);
            sDescription = sDescription.split(";")[0];
        }
        if (sDescription == null) {
            sDescription = "";
        }
        if (getField(oFormData, sID_Field).getType() instanceof TableFormType) {
            //sDescription = sDescription+"[table]";
            sDescription = sDescription + "[table][id=" + sID_Field + "]";
        }
        LOG.info("(sDescription={})", sDescription);

        if (sFieldValue.length() > 15) { //ид редиса. грузим со стартаски
            //получение контента файла из временного хранилища
            byte[] aByteFile;
            ByteArrayMultipartFile oByteArrayMultipartFile = null;
            try {
                aByteFile = oBytesDataInmemoryStorage.getBytes(sFieldValue); //Вытягиваем массив байт (контент файла) из Редиса по ключу редиса
                oByteArrayMultipartFile = getByteArrayMultipartFileFromStorageInmemory(aByteFile); //приводим к MultipartFile
            } catch (Exception oException) {
                LOG.error("sID_Field: " + sID_Field, oException); //TODO: Need remove because of new Log(
                new Log(oException, LOG)//this.getClass()
                        ._Case("Activiti_AttachRedisFail")
                        ._Status(Log.LogStatus.ERROR)
                        ._Head("Can't get content from Redis for attachment")
                        ._Body(oException.getMessage())
                        //._Exception(oException)
                        //._Param("n", n)
                        ._Param("sID_Field", sID_Field)
                        ._Param("sKeyRedis", sFieldValue)
                        ._Param("sDescription", sDescription)
                        ._Param("sID_Order", generalConfig.getOrderId_ByProcess(oExecution.getProcessInstanceId()))
                        //._Param("oExecution.getProcessInstanceId()", oExecution.getProcessInstanceId())
                        ._Param("oExecution.getProcessDefinitionId()", oExecution.getProcessDefinitionId())
                        ._Param("oTask.getId()", oTask.getId())
                        ._Param("oTask.getName()", oTask.getName())
                        .save();
                throw new ActivitiException(oException.getMessage(), oException);
            }
            //------------------------------------------------------------------------------------------------
            Attachment oAttachment = createAttachment(oByteArrayMultipartFile, oTask, sDescription); // передаем контент файла, Execution таски, имя поля

            if (oAttachment != null) {
                LOG.info("Added attachment with ID {} to the task:process {}:{}",
                        oAttachment.getId(), oTask.getId(), oExecution.getProcessInstanceId());
                aAttachment.add(oAttachment);
                String nID_Attachment = oAttachment.getId();
                LOG.info("Try set variable(sID_Field={}) with the value(nID_Attachment={}), for new attachment...",
                        sID_Field, nID_Attachment);
                oExecution.getEngineServices().getRuntimeService()
                        .setVariable(oExecution.getProcessInstanceId(), sID_Field, nID_Attachment); //Цепляем аттачмент к таске вот тут
                LOG.info("Finished setting new value for variable with attachment (sID_Field={})",
                        sID_Field);
            } else {
                LOG.error("Can't add attachment to (oTask.getId()={})", oTask.getId()); //TODO: Need remove because of new Log(
                new Log(this.getClass(), LOG)//this.getClass()
                        ._Case("Activiti_AttachRedisFail")
                        ._Status(Log.LogStatus.ERROR)
                        ._Head("Can't create Attachment for Task")
                        ._Body("oAttachment == null")
                        //._Exception(oException)
                        //._Param("n", n)
                        ._Param("sID_Field", sID_Field)
                        ._Param("sKeyRedis", sFieldValue)
                        ._Param("sDescription", sDescription)
                        ._Param("sID_Order", generalConfig.getOrderId_ByProcess(oExecution.getProcessInstanceId()))
                        //._Param("oExecution.getProcessInstanceId()", oExecution.getProcessInstanceId())
                        ._Param("oExecution.getProcessDefinitionId()", oExecution.getProcessDefinitionId())
                        ._Param("oTask.getId()", oTask.getId())
                        ._Param("oTask.getName()", oTask.getName())
                        .save();
            }

        } else { //если ид  - не редиста
            try {
                LOG.info("Checking whether attachment with ID {} has already been saved and this is attachment object ID", sFieldValue);
                Attachment oAttachment = oExecution.getEngineServices().getTaskService().getAttachment(sFieldValue);
                aAttachment.add(oAttachment); //То атач уже создан и сохранен
            } catch (Exception oException) {
                LOG.error("Invalid Redis Key!!! (sKeyRedis={})", sFieldValue);
                new Log(oException, LOG)//this.getClass()
                        ._Case("Activiti_AttachRedisKeyFail")
                        ._Status(Log.LogStatus.ERROR)
                        ._Head("Invalid Redis Key of Attachment")
                        ._Body(oException.getMessage())
                        //._Exception(oException)
                        //._Param("n", n)
                        ._Param("sID_Field", sID_Field)
                        ._Param("sKeyRedis", sFieldValue)
                        ._Param("sDescription", sDescription)
                        ._Param("sID_Order", generalConfig.getOrderId_ByProcess(oExecution.getProcessInstanceId()))
                        //._Param("oExecution.getProcessInstanceId()", oExecution.getProcessInstanceId())
                        ._Param("oExecution.getProcessDefinitionId()", oExecution.getProcessDefinitionId())
                        ._Param("oTask.getId()", oTask.getId())
                        ._Param("oTask.getName()", oTask.getName())
                        .save();
            }
        }
        return aAttachment;
    }

    /**
     * Adds Attachemnts based on formData to task.
     *
     * @param oFormData FormData from task where we search file fields.
     * @param oTask where we add Attachments.
     * @return list of Attachment
     */
    public List<Attachment> addAttachmentsToTask(FormData oFormData, DelegateTask oTask){
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date date = new Date();
        
        DelegateExecution oExecution = oTask.getExecution();
        List<Attachment> aAttachment = new LinkedList<>();
        LOG.info("addAttachmentsToTask is used... " + dateFormat.format(date));
        LOG.info("SCAN:file");
        List<String> asFieldID = getListFieldCastomTypeFile(oFormData);
        LOG.info("[addAttachmentsToTask]");
        LOG.info("(asFieldID in new schema={})", asFieldID);
        List<String> asFieldValue = getVariableValues(oExecution, asFieldID);
        LOG.info("(asFieldValue in new schema ={})", asFieldValue);
        List<String> asFieldName = getListCastomFieldName(oFormData);
        LOG.info("(asFieldName in new schema ={})", asFieldName);

        if (!asFieldValue.isEmpty()) {
            int n = 0;
            for (String sFieldValue : asFieldValue) {
                LOG.info(dateFormat.format(date) + "(sFieldValue={})", sFieldValue);
                
                String sCurrFieldID = asFieldID.get(n);
                String sCurrFieldName = asFieldID.get(n);
                
                if (sFieldValue != null && !sFieldValue.isEmpty() && !"".equals(sFieldValue.trim()) && !"null"
                        .equals(sFieldValue.trim())) {
                    if (!asFieldName.isEmpty() && n < asFieldName.size()) {
                        
                        JSONObject oJsonTaskAttachVO = null;
                        JSONParser parser = new JSONParser(); 
                        
                        try {
                            LOG.info("Parsing value + " + sFieldValue + " time: " + dateFormat.format(date));
                            oJsonTaskAttachVO = (JSONObject)parser.parse(sFieldValue);
                        } catch (ParseException ex) {
                            LOG.info("There aren't TaskAttachVO objects in sFieldValue - JSON parsing error: ", ex);
                        }
                        
                        if(oJsonTaskAttachVO != null && oJsonTaskAttachVO.get("sID_StorageType") != null){ //try to process field with new logic
                            LOG.info("It is new JSON object: " + oJsonTaskAttachVO.toJSONString());
                            
                            if (getField(oFormData, asFieldID.get(n)).getType() instanceof TableFormType) {
                                LOG.info("it is a table type");
                                MultipartFile oTableMultipartfile = null;
                                try{       
                                    oTableMultipartfile = oAttachmetService.getAttachment(null, null, (String)oJsonTaskAttachVO.get("sKey"), (String)oJsonTaskAttachVO.get("sID_StorageType"));
                                    if (oTableMultipartfile != null){
                                        LOG.info("oTableMultipartfile content is: " + IOUtils.toString(oTableMultipartfile.getInputStream()));
                                            //oTableMultipartfileContent
                                            JSONObject oTableJSONObject = null;
                                            try {
                                                oTableJSONObject = (JSONObject) parser.parse(IOUtils.toString(oTableMultipartfile.getInputStream()));
                                            } 
                                            catch (ParseException ex) {
                                                LOG.info("Some error during table parsing : ", ex);
                                            }
                                            
                                            if (oTableJSONObject != null && oTableJSONObject.get("aRow") != null){ //try to process table
                                            {
                                                JSONArray aJsonRow = (JSONArray) oTableJSONObject.get("aRow");
                                                for(int i = 0; i < aJsonRow.size(); i++){
                                                    
                                                    JSONObject oJsonField = (JSONObject) aJsonRow.get(i);
                                                    
                                                    if (oJsonField != null) {
                                                        JSONArray aJsonField = (JSONArray) oJsonField.get("aField");
                                                    
                                                        if (aJsonField != null) {
                                                            for (int j = 0; j < aJsonField.size(); j++) {
                                                                JSONObject oJsonMap = (JSONObject) aJsonField.get(j);
                                                                
                                                                Object oValue = oJsonMap.get("type");
                                                                if ("file".equals((String)oValue)){
                                                                    
                                                                    String oFileValue = (String)oJsonMap.get("value");
                                                                    LOG.info("Current file value in the table is: " + oFileValue);
                                                                    
                                                                    JSONObject oJsonTableFile = null;

                                                                    try {
                                                                        oJsonTableFile = (JSONObject)parser.parse(oFileValue);
                                                                    } catch (ParseException ex) {
                                                                        LOG.info("There aren't TaskAttachVO objects in sFieldValue in table - JSON parsing error: ", ex);
                                                                    }
                                                                    
                                                                    if(oJsonTableFile != null && oJsonTableFile.get("sID_StorageType") != null){

                                                                        MultipartFile oMultipartFile = null;

                                                                        try {
                                                                            oMultipartFile = oAttachmetService
                                                                                    .getAttachment(null, null, (String)oJsonTableFile.get("sKey"), "Redis");
                                                                        } catch (ParseException | RecordInmemoryException | IOException | ClassNotFoundException | CRCInvalidException | RecordNotFoundException ex) {
                                                                            LOG.info("getAttachment has some errors: " + ex);
                                                                        }
                                                                        
                                                                        if (oMultipartFile != null) {
                                                                            try {
                                                                                JSONArray aJSONAttribute = (JSONArray) oJsonTaskAttachVO.get("aAttribute");
                                                                                List<Map<String, Object>> aAttribute = new ArrayList<>();

                                                                                if (!aJSONAttribute.isEmpty()) {
                                                                                    for (Object oAttributeElem : aJSONAttribute) {
                                                                                        Map<String, Object> mParam = new HashMap<>();
                                                                                        mParam.put((String) ((JSONObject) oAttributeElem).get("sID"), ((JSONObject) oAttributeElem).get("sValue"));
                                                                                        aAttribute.add(mParam);
                                                                                    }
                                                                                }

                                                                                byte[] aByteFile = oMultipartFile.getBytes();

                                                                                String sNewTableElemValue = oAttachmetService.createAttachment(oExecution.getProcessInstanceId(), oFileValue.get("id"),
                                                                                        (String) oJsonTableFile.get("sFileNameAndExt"),
                                                                                        (boolean) oJsonTableFile.get("bSigned"), "Mongo", "text/html",
                                                                                        aAttribute, aByteFile, false);
                                                                                
                                                                                oJsonMap.replace("value", sNewTableElemValue);

                                                                            } catch (IOException|CRCInvalidException|RecordNotFoundException ex) {
                                                                                LOG.info("createAttachment has some errors: " + ex);
                                                                            }
                                                                        } 
                                                                        else {
                                                                            LOG.info("oVariableMultipartFile is null");
                                                                        }
                                                                    }
                                                               }
                                                                else{
                                                                    LOG.info("new table element type is: " + oJsonMap.get("type"));
                                                                    LOG.info("new table element id is: " + oJsonMap.get("id"));
                                                                    LOG.info("new table element value is: " + oJsonMap.get("value"));
                                                                }
                                                                LOG.info("aJsonField before setting: " + aJsonField.toJSONString());
                                                                aJsonField.set(j, oJsonMap);
                                                                LOG.info("aJsonField after setting: " + aJsonField.toJSONString());
                                                            }
                                                        }
                                                        LOG.info("oJsonField before setting: " + oJsonField.toJSONString());
                                                        oJsonField.replace("aField", aJsonField);
                                                        LOG.info("oJsonField after setting: " + oJsonField.toJSONString());
                                                        LOG.info("aJsonRow before setting: " + oJsonField.toJSONString());
                                                        aJsonRow.set(i, oJsonField);
                                                        LOG.info("aJsonRow after setting: " + oJsonField.toJSONString());
                                                    }
                                                }
                                                LOG.info("oTableJSONObject before setting: " + oTableJSONObject.toJSONString());
                                                oTableJSONObject.replace("aRow", aJsonRow);
                                                LOG.info("oTableJSONObject after setting: " + oTableJSONObject.toJSONString());
                                            }
                                        }
                                        
                                        if(oTableJSONObject != null){
                                            JSONArray aJSONAttribute = (JSONArray) oJsonTaskAttachVO.get("aAttribute");
                                            List<Map<String, Object>> aAttribute = new ArrayList<>();

                                            if (!aJSONAttribute.isEmpty()) {
                                                for (Object oAttributeElem : aJSONAttribute) {
                                                    Map<String, Object> mParam = new HashMap<>();
                                                    mParam.put((String) ((JSONObject) oAttributeElem).get("sID"), ((JSONObject) oAttributeElem).get("sValue"));
                                                    aAttribute.add(mParam);
                                                }
                                            }

                                            byte[] aByteContent = oTableJSONObject.toJSONString().getBytes(Charsets.UTF_8);

                                            oAttachmetService.createAttachment(oExecution.getProcessInstanceId(), sCurrFieldID,
                                                        (String) oJsonTaskAttachVO.get("sFileNameAndExt"),
                                                        (boolean) oJsonTaskAttachVO.get("bSigned"), "Mongo", "text/html",
                                                        aAttribute, aByteContent, true);
                                        }
                                    }
                                    else{
                                        LOG.info("oTableMultipartfile is null");
                                    }
                                }
                                catch(RecordInmemoryException|IOException|ClassNotFoundException|CRCInvalidException|RecordNotFoundException|ParseException ex){
                                    LOG.info("Error of getting oTableMultipartfile: " + ex);
                                }
                            }
                            else{
                               addNewAttachmentToTask(oExecution, oJsonTaskAttachVO, sCurrFieldID);
                            }
                        }
                        else{ //Old logic
                            LOG.info("It is old object");
                            aAttachment = addOldAttachmentToTask(oTask, oExecution, oFormData, sFieldValue, aAttachment, sCurrFieldID, sCurrFieldName);
                    
                        }
                    } else {
                        LOG.error("asFieldName has nothing! (asFieldName={})", asFieldName);
                    }
                }
                n++;
            }
        }
        scanExecutionOnQueueTickets(oExecution, oFormData);
        //return aAttachemet;
        return aAttachment;

    }

    public Attachment createAttachment(ByteArrayMultipartFile oByteArrayMultipartFile, DelegateTask oTask, String sDescription) {
        DelegateExecution oExecution = oTask.getExecution();
        Attachment oAttachment = null;
        if (oByteArrayMultipartFile != null) {
            String sFileName = null;
            try {
                sFileName = new String(oByteArrayMultipartFile.getOriginalFilename().getBytes(),
                        "UTF-8");
            } catch (java.io.UnsupportedEncodingException oException) {
                LOG.error("error on getting sFileName: {}", oException.getMessage());
                LOG.debug("FAIL:", oException);
                throw new ActivitiException(oException.getMessage(), oException);
            }
            LOG.info("(sFileName={})", sFileName);
            InputStream oInputStream = null;
            try {
                oInputStream = oByteArrayMultipartFile.getInputStream();
            } catch (Exception e) {
                throw new ActivitiException(e.getMessage(), e);
            }
            oAttachment = oExecution.getEngineServices().getTaskService().createAttachment(
                    oByteArrayMultipartFile.getContentType() + ";" + oByteArrayMultipartFile.getExp(),
                    oTask.getId(), oExecution.getProcessInstanceId(), sFileName, sDescription,
                    oInputStream);
        } else {
            LOG.error("oByteArrayMultipartFile==null!!!!!!!!!!!!!");
        }
        return oAttachment;
    }

    public void scanExecutionOnQueueTickets(DelegateExecution oExecution,
            FormData oFormData) {
        LOG.info("SCAN:queueData");
        List<String> asFieldID = getListField_QueueDataFormType(oFormData);//startformData
        LOG.info("(asFieldID={})", asFieldID.toString());
        List<String> asFieldValue = getVariableValues(oExecution, asFieldID);
        LOG.info("(asFieldValue={})", asFieldValue.toString());
        if (!asFieldValue.isEmpty()) {
            String sValue = asFieldValue.get(0);
            String sID = asFieldID.get(0);
            LOG.info("(sValue={})", sValue);
            if (sValue != null && !"".equals(sValue.trim()) && !"null".equals(sValue.trim())) {
                LOG.info("sValue is present, so queue is filled");
                long nID_FlowSlotTicket = 0;
                Map<String, Object> m = QueueDataFormType.parseQueueData(sValue);

                String sDate = (String) m.get(QueueDataFormType.sDate);
                LOG.info("(sDate={})", sDate);
                String sID_Type = QueueDataFormType.get_sID_Type(m);
                LOG.info("(sID_Type={})", sID_Type);

                if ("DMS".equals(sID_Type)) {//Нет ни какой обработки т.к. это внешняя ЭО
                    String snID_ServiceCustomPrivate = m.get("nID_ServiceCustomPrivate") + "";
                    LOG.info("(nID_ServiceCustomPrivate={})", snID_ServiceCustomPrivate);
                    String sTicket_Number = (String) m.get("ticket_number");
                    LOG.info("(sTicket_Number={})", sTicket_Number);
                    String sTicket_Code = (String) m.get("ticket_code");
                    LOG.info("(sTicket_Code={})", sTicket_Code);
                    //}else if("iGov".equals(sID_Type)){
                } else {
                    nID_FlowSlotTicket = QueueDataFormType.get_nID_FlowSlotTicket(m);
                    LOG.info("(nID_FlowSlotTicket={})", nID_FlowSlotTicket);
                    //int nSlots = QueueDataFormType.get_nSlots(m);
                    String snSlots = getVariableValue(oExecution, "nSlots_" + sID);
                    int nSlots = snSlots != null ? Integer.valueOf(snSlots) : 1;
                    try {

                        long nID_Task_Activiti = 1; //TODO set real ID!!!

                        try {
                            nID_Task_Activiti = Long.valueOf(oExecution.getProcessInstanceId());
                            LOG.info("nID_Task_Activiti:Ok!");
                        } catch (Exception oException) {
                            LOG.error("nID_Task_Activiti:Fail! :{}", oException.getMessage());
                            LOG.debug("FAIL:", oException);
                        }
                        LOG.info("nID_Task_Activiti=" + nID_Task_Activiti);

                        FlowSlotTicket oFlowSlotTicket = oFlowSlotTicketDao.findById(nID_FlowSlotTicket).orNull();
                        if (oFlowSlotTicket == null) {
                            String sError = "FlowSlotTicket with id=" + nID_FlowSlotTicket + " is not found!";
                            LOG.error(sError);
                            throw new Exception(sError);
                        } else if (oFlowSlotTicket.getnID_Task_Activiti() != null) {
                            if (nID_Task_Activiti == oFlowSlotTicket.getnID_Task_Activiti()) {
                                String sWarn = "FlowSlotTicket with id=" + nID_FlowSlotTicket
                                        + " has assigned same getnID_Task_Activiti()=" + oFlowSlotTicket.getnID_Task_Activiti();
                                LOG.warn(sWarn);
                            } else {
                                String sError
                                        = "FlowSlotTicket with id=" + nID_FlowSlotTicket + " has assigned getnID_Task_Activiti()="
                                        + oFlowSlotTicket.getnID_Task_Activiti();
                                LOG.error(sError);
                                throw new Exception(sError);
                            }
                        } else {
                            LOG.info("(nID_FlowSlot={})", !oFlowSlotTicket.getaFlowSlot().isEmpty()
                                    ? oFlowSlotTicket.getaFlowSlot().get(0).getId() : null);
                            long nID_Subject = oFlowSlotTicket.getnID_Subject();
                            LOG.info("(nID_Subject={})", nID_Subject);

                            oFlowSlotTicket.setnID_Task_Activiti(nID_Task_Activiti);
                            oFlowSlotTicketDao.saveOrUpdate(oFlowSlotTicket);
                            LOG.info("(JSON={})", JsonRestUtils
                                    .toJsonResponse(new SaveFlowSlotTicketResponse(oFlowSlotTicket.getId(), nSlots)));
                            oExecution.setVariable("date_of_visit", sDate);
                            LOG.info("(date_of_visit={})", sDate);
                        }
                    } catch (Exception oException) {
                        LOG.error("Error scanExecutionOnQueueTickets: {}", oException.getMessage());
                        LOG.debug("FAIL:", oException);
                    }
                }

            }
        }

    }

    public List<Attachment> findAttachments(String sAttachments, String processInstanceId) {
        sAttachments = sAttachments == null ? "" : sAttachments;

        List<Attachment> aAttachment = new ArrayList<>();

        String[] asID_Attachment = sAttachments.split(",");

        for (int i = 0; i < asID_Attachment.length; i++) {
            asID_Attachment[i] = asID_Attachment[i].trim();
        }

        List<String> aAttachmentNotFound = new ArrayList<>();

        for (String sID_Attachment : asID_Attachment) {
            if (sID_Attachment != null && !"".equals(sID_Attachment.trim()) && !"null".equals(sID_Attachment.trim())) {
                String sID_AttachmentTrimmed = sID_Attachment.replaceAll("^\"|\"$", "");

                Attachment oAttachment = taskService.getAttachment(sID_AttachmentTrimmed);

                if (oAttachment != null) {
                    aAttachment.add(oAttachment);
                } else {
                    aAttachmentNotFound.add(sID_AttachmentTrimmed);
                }
            } else {
                LOG.warn("(sID_Attachment={})", sID_Attachment);
            }
        }
        if (!aAttachmentNotFound.isEmpty()) {
            //the next line returns no collection hence no items from aAttachmentNotFound are added to aAttachment; consider replacing
            List<Attachment> aAttachmentByProcess = taskService.getProcessInstanceAttachments(processInstanceId);

            for (Attachment attachmentByProcess : aAttachmentByProcess) {
                LOG.info("Attachment info={}, attachment.getId()={}", attachmentByProcess.getDescription(), attachmentByProcess.getId());
                if (!aAttachmentNotFound.contains(attachmentByProcess.getId())) {
                    aAttachment.add(attachmentByProcess);
                }
            }
        }
        return aAttachment;
    }

}
