package org.igov.io.sms;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import javax.annotation.PostConstruct;

import org.igov.io.GeneralConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;

@Component
public class ManagerSMS {

    private final static Logger LOG = LoggerFactory.getLogger(ManagerSMS.class);

    private String sURL_Send = null;
    private String sMerchantId = null;
    private String sMerchantPassword = null;

    // Признак готовности сервиса отсылать сообщения
    private boolean isReadySendSMS = false;

    @Autowired
    GeneralConfig generalConfig;

    /*
     * Проверяем заданы ли все параметры для отсылки СМС. Если нет то сервис не
     * готов отсылать сообщения.
     */
    @PostConstruct
    private void init() {
	sURL_Send = generalConfig.getURL_Send_SMS();
	sMerchantId = generalConfig.getMerchantId_SMS();
	sMerchantPassword = generalConfig.getMerchantPassword_SMS();
//	sURL_Send = "https://sms-inner.siteheart.com/api/send_sms.api";
//	sMerchantId = "1070";
//	sMerchantPassword = "111";

	LOG.debug("general.SMS.sURL_Send={}, general.SMS.sMerchantId={}, general.SMS.sMerchantPassword=*****",
		sURL_Send, sMerchantId);

	if (sURL_Send.startsWith("${") || sMerchantId.startsWith("${") || sMerchantPassword.startsWith("${")) {
	    LOG.error("Сервис не готов к отсылке сообщений. Не заданы необходимые параметры");
	    return;
	}
	
	LOG.info("Сервис готов к отсылке сообщений.");
	isReadySendSMS = true;
    }

    public String sendSMS(String sPhone, String sText) throws IllegalArgumentException, IOException {
	if (!isReadySendSMS) {
	    LOG.error("Сервис не готов к отсылке сообщений.");
	    return "";
	}

	SMS sms;
	try {
	    sms = new SMS(sPhone, sText);
	} catch (IllegalArgumentException e) {
	    LOG.error("Ошибка создания SMS. sPhone={}, sText={}", sPhone, sText, e);
	    return "";
	}

	SMSReqest smsReqest = new SMSReqest(sMerchantId, sMerchantPassword);
	smsReqest.addSMS(sms);
	Gson oGson = new Gson();

	String stringSmsReqest = oGson.toJson(smsReqest);

	LOG.info("(sURL={},jsonObj={})", sURL_Send, stringSmsReqest);

	URL oURL = new URL(sURL_Send);
	HttpURLConnection oHttpURLConnection = (HttpURLConnection) oURL.openConnection();
	oHttpURLConnection.setRequestMethod("POST");
	oHttpURLConnection.setRequestProperty("content-type", "application/json;charset=UTF-8");
	oHttpURLConnection.setDoOutput(true);

	DataOutputStream oDataOutputStream = new DataOutputStream(oHttpURLConnection.getOutputStream());
	oDataOutputStream.writeBytes(stringSmsReqest);
	oDataOutputStream.flush();
	oDataOutputStream.close();

	BufferedReader oBufferedReader = new BufferedReader(new InputStreamReader(oHttpURLConnection.getInputStream()));
	StringBuilder os = new StringBuilder();
	String s;
	while ((s = oBufferedReader.readLine()) != null) {
	    os.append(s);
	}
	oBufferedReader.close();
	return os.toString();

    }

//    public static void main(String[] args) {
//	 ManagerSMS managerSMS = new ManagerSMS();
//	
//	 managerSMS.init();
//	 try {
//	    String ret = managerSMS.sendSMS("+380923046007", "text test");
//	    
//	    System.out.println(ret);
//	} catch (IllegalArgumentException e) {
//	    e.printStackTrace();
//	} catch (IOException e) {
//	    e.printStackTrace();
//	}
//    }

}
