package org.igov.io;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import static org.igov.util.ToolLuna.getProtectedNumber;

/**
 * @author bw
 */
@Component("generalConfig")
public class GeneralConfig {

    private final static Logger LOG = LoggerFactory.getLogger(GeneralConfig.class);
    
    @Value("${general.Self.bTest}")
    private Boolean bTest_Self;
    @Value("${general.Self.nID_Server}")
    private Integer nID_Server_Self;
    @Value("${general.Self.sHost}")
    private String sHost_Self;
    @Value("${general.sHostCentral}")
    private String sHostCentral_Self;
    @Value("${general.Auth.sLogin}")
    private String sLogin_Auth;
    @Value("${general.Auth.sPassword}")
    private String sPassword_Auth;

    @Value("${general.Bank.PB.Receipt.Auth.sLogin}")
    private String sLogin_Auth_Receipt_PB_Bank;
    @Value("${general.Bank.PB.Receipt.Auth.sPassword}")
    private String sPassword_Auth_Receipt_PB_Bank;
    @Value("${general.Bank.PB.Receipt.Auth.sURL_GenerateSID}")
    private String sURL_GenerateSID_Auth_Receipt_PB_Bank;
    @Value("${general.Bank.PB.Receipt.sURL_DocumentSimple}")
    private String sURL_DocumentSimple_Receipt_PB_Bank;
    @Value("${general.Bank.PB.Receipt.sURL_DocumentByAccounts}")
    private String sURL_DocumentByAccounts_Receipt_PB_Bank;
    @Value("${general.Bank.PB.Receipt.sURL_DocumentCallback}")
    private String sURL_DocumentCallback_Receipt_PB_Bank;
    
    @Value("${general.SED.UkrDoc.Auth.sLogin}")
    private String sLogin_Auth_UkrDoc_SED;
    @Value("${general.SED.UkrDoc.Auth.sPassword}")
    private String sPassword_Auth_UkrDoc_SED;
    @Value("${general.SED.UkrDoc.Auth.sURL_GenerateSID}")
    private String sURL_GenerateSID_Auth_UkrDoc_SED;
    @Value("${general.SED.UkrDoc.sURL}")
    private String sURL_UkrDoc_SED;
    
    @Value("${general.Mail.UniSender.bEnable}")
    private Boolean bEnable_UniSender_Mail;
    @Value("${general.Mail.UniSender.sKeyAPI}")
    private String sKey_UniSender_Mail;
    @Value("${general.Mail.UniSender.nID_SendList}")
    private Integer nID_SendList_UniSender_Mail;
    @Value("${general.Mail.UniSender.sURL}")
    private String sURL_UniSender_Mail;
    @Value("${general.Mail.UniSender.sContext_Subscribe}")
    private String sContext_Subscribe_UniSender_Mail;
    @Value("${general.Mail.UniSender.sContext_CreateMail}")
    private String sContext_CreateMail_UniSender_Mail;
    @Value("${general.Mail.UniSender.sContext_CreateCompain}")
    private String sContext_CreateCompain_UniSender_Mail;
    
    @Value("${general.Auth.BankID.PB.sLogin}")
    private String sLogin_BankID_PB_Auth;
    @Value("${general.Auth.BankID.PB.sPassword}")
    private String sPassword_BankID_PB_Auth;
    
    @Value("${general.Auth.BankID.PB.AccessToken.sHost}")
    private String sHost_AccessToken_BankID_PB_Auth;
    @Value("${general.Auth.BankID.PB.AccessToken.sPath}")
    private String sPath_AccessToken_BankID_PB_Auth;
    @Value("${general.Auth.BankID.PB.Authorize.sHost}")
    private String sHost_Authorize_BankID_PB_Auth;
    @Value("${general.Auth.BankID.PB.Authorize.sPath}")
    private String sPath_Authorize_BankID_PB_Auth;
    @Value("${general.Auth.BankID.PB.sURL_ResourceSignature}")
    private String sURL_ResourceSignature_BankID_PB_Auth;
    
    
    @Value("${general.Exchange.Corezoid.sID_User}")
    private String sUser_Corezoid_Exchange;
    @Value("${general.Exchange.Corezoid.sSecretKey}")
    private String sSecretKey_Corezoid_Exchange;

    // MSG Properties
    @Value("${general.Monitor.MSG.sURL}")
    private String sURL_MSG_Monitor;
    @Value("${general.Monitor.MSG.sBusinessId}")
    private String sBusinessId_MSG_Monitor;
    @Value("${general.Monitor.MSG.sTemplateId}")
    private String sTemplateId_MSG_Monitor;
    @Value("${general.Monitor.MSG.sLogin}")
    private String sLogin_MSG_Monitor;
    
    @Value("${general.OTP.sURL_Send}")
    private String sURL_Send_OTP;
    @Value("${general.OTP.sID_Merchant}")
    private String sMerchantId_OTP;
    @Value("${general.OTP.sPasswordMerchant}")
    private String sMerchantPassword_OTP;
    
    @Value("${general.LiqPay.sURL_CheckOut}")
    private String sURL_CheckOut_LiqPay;

    
    public boolean isSelfTest() {
        boolean b = true;
        try {
            b = (bTest_Self == null ? b : bTest_Self);
            //LOG.info("(sbTest={})", sbTest_Self);
        } catch (Exception oException) {
            LOG.error("Bad: {} (sbTest={})", oException.getMessage(), bTest_Self);
            LOG.debug("FAIL:", oException);
        }
        return b;
    }
    
    public String getURL_MSG_Monitor() {
        return sURL_MSG_Monitor;
    }
    public String getBusinessId_MSG_Monitor() {
        return sBusinessId_MSG_Monitor;
    }
    public String getTemplateId_MSG_Monitor() {
        return sTemplateId_MSG_Monitor;
    }
    public String getLogin_MSG_Monitor() {
        return sLogin_MSG_Monitor;
    }
        
    public String getLogin_BankID_PB_Auth() {
        return sLogin_BankID_PB_Auth;
    }
    public String getPassword_BankID_PB_Auth() {
        return sPassword_BankID_PB_Auth;
    }
    public String getHost_AccessToken_BankID_PB_Auth() {
        return sHost_AccessToken_BankID_PB_Auth != null ? sHost_AccessToken_BankID_PB_Auth : "bankid.privatbank.ua";
    }
    public String getPath_AccessToken_BankID_PB_Auth() {
        return sPath_AccessToken_BankID_PB_Auth != null ? sPath_AccessToken_BankID_PB_Auth : "/DataAccessService/oauth/token";
    }
    public String getHost_Authorize_BankID_PB_Auth() {
        return sHost_Authorize_BankID_PB_Auth != null ? sHost_Authorize_BankID_PB_Auth : "bankid.privatbank.ua";
    }
    public String getPath_Authorize_BankID_PB_Auth() {
        return sPath_Authorize_BankID_PB_Auth != null ? sPath_Authorize_BankID_PB_Auth : "/DataAccessService/das/authorize";
    }
    public String getURL_ResourceSignature_BankID_PB_Auth() {
        return sURL_ResourceSignature_BankID_PB_Auth != null ? sURL_ResourceSignature_BankID_PB_Auth : "https://bankid.privatbank.ua/ResourceService/checked/signatureData";
    }
    
    public String getSelfHost() {
        return sHost_Self;
    }
    public String getSelfHostCentral() {
        return sHostCentral_Self;
    }
    public String getAuthLogin() {
        return sLogin_Auth;
    }
    public String getAuthPassword() {
        return sPassword_Auth;
    }
    
    public String getLogin_Auth_Receipt_PB_Bank() {
        return sLogin_Auth_Receipt_PB_Bank;
    }
    public String getPassword_Auth_Receipt_PB_Bank() {
        return sPassword_Auth_Receipt_PB_Bank;
    }
    public String getURL_GenerateSID_Auth_Receipt_PB_Bank() {
        return sURL_GenerateSID_Auth_Receipt_PB_Bank;
    }
    public String sURL_DocumentKvitanciiForIgov() {
        return sURL_DocumentSimple_Receipt_PB_Bank;
    }
    public String sURL_DocumentKvitanciiForAccounts() {
        return sURL_DocumentByAccounts_Receipt_PB_Bank;
    }
    public String sURL_DocumentKvitanciiCallback() {
        return sURL_DocumentCallback_Receipt_PB_Bank;
    }
    
    public String getLogin_Auth_UkrDoc_SED() {
        return sLogin_Auth_UkrDoc_SED;
    }
    public String getPassword_Auth_UkrDoc_SED() {
        return sPassword_Auth_UkrDoc_SED;
    }
    public String getURL_GenerateSID_Auth_UkrDoc_SED() {
        return sURL_GenerateSID_Auth_UkrDoc_SED;
    }
    public String getURL_UkrDoc_SED() {
        return sURL_UkrDoc_SED;
    }
    
    public String getUser_Coreziod_Exchange() {
        return sUser_Corezoid_Exchange;
    }
    public String getSecretKey_Coreziod_Exchange() {
        return sSecretKey_Corezoid_Exchange;
    }

    public String getURL_Send_OTP()  {
        return sURL_Send_OTP;
    }
    public String getMerchantId_OTP()  {
        return sMerchantId_OTP;
    }
    public String getMerchantPassword_OTP()  {
        return sMerchantPassword_OTP;
    }
    
    public Boolean isEnable_UniSender_Mail() {
        return bEnable_UniSender_Mail;
    }
    public String getURL_UniSender_Mail() {
        return sURL_UniSender_Mail;
    }
    public String getContext_Subscribe_UniSender_Mail() {
        return sContext_Subscribe_UniSender_Mail;
    }
    public String getContext_CreateMail_UniSender_Mail() {
        return sContext_CreateMail_UniSender_Mail;
    }
    public String getContext_CreateCompain_UniSender_Mail() {
        return sContext_CreateCompain_UniSender_Mail;
    }
    public String getKey_UniSender_Mail() {
        return sKey_UniSender_Mail;
    }
    public long getSendListId_UniSender_Mail() {
        try {
            return nID_SendList_UniSender_Mail;
        } catch (NumberFormatException oException) {
            LOG.warn("can't parse nID_SendList_Unisender!: {} (nID_SendList_Unisender={})", oException.getMessage(), nID_SendList_UniSender_Mail);
            return 5998742; //default list_id
        }
    }
    
    public String getURL_CheckOut_LiqPay() {
        return sURL_CheckOut_LiqPay;
    }

    
    
    public Integer getSelfServerId() {
        Integer nID_Server = null;
        try {
            if (nID_Server_Self == null) {
                nID_Server = 0;
                throw new NumberFormatException("snID_Server=" + nID_Server_Self);
            }
            nID_Server = nID_Server_Self;
            if (nID_Server == null || nID_Server < 0) {
                nID_Server = 0;
                throw new NumberFormatException("nID_Server=" + nID_Server);
            }
        } catch (NumberFormatException oNumberFormatException) {
            nID_Server = 0;
            LOG.warn("can't parse nID_Server: {} (nID_Server={})", oNumberFormatException.getMessage(), nID_Server_Self);
        }
        return nID_Server;
    }
    
    
    public String sID_Order_ByOrder(Long nID_Order) {
        return sID_Order_ByOrder(getSelfServerId(), nID_Order);
    }
    public String sID_Order_ByOrder(Integer nID_Server, Long nID_Order) {
        return new StringBuilder(nID_Server + "").append("-").append(nID_Order).toString();
    }
    public String sID_Order_ByProcess(Long nID_Process) {
        return sID_Order_ByOrder(getProtectedNumber(nID_Process));
    }
    public String sID_Order_ByProcess(Integer nID_Server, Long nID_Process) {
        return sID_Order_ByOrder(getSelfServerId(), getProtectedNumber(nID_Process));
    }
    
}
