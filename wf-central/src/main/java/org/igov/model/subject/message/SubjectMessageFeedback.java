package org.igov.model.subject.message;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.igov.model.core.AbstractEntity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "SubjectMessageFeedback")
public class SubjectMessageFeedback extends AbstractEntity {
    @JsonProperty(value = "sID_Source")
    @Column(name = "sID_Source", nullable = false)
    private String sID_Source;

    @JsonProperty(value = "sAuthorFIO")
    @Column(name = "sAuthorFIO", nullable = false)
    private String sAuthorFIO;

    @JsonProperty(value = "sMail")
    @Column(name = "sMail", nullable = false)
    private String sMail;

    @JsonProperty(value = "sHead")
    @Column(name = "sHead", nullable = false)
    private String sHead;

    @JsonProperty(value = "sBody")
    @Column(name = "sBody", nullable = false)
    private String sBody;

    @JsonProperty(value = "nID_Rate")
    @Column(name = "nID_Rate", nullable = false)
    private Long nID_Rate;

    @JsonProperty(value = "nID_Service")
    @Column(name = "nID_Service", nullable = false)
    private Long nID_Service;

    @JsonProperty(value = "sID_Token")
    @Column(name = "sID_Token", nullable = false)
    private String sID_Token;

    public String getsID_Source() {
        return sID_Source;
    }

    public void setsID_Source(String sID_Source) {
        this.sID_Source = sID_Source;
    }

    public String getsAuthorFIO() {
        return sAuthorFIO;
    }

    public void setsAuthorFIO(String sAuthorFIO) {
        this.sAuthorFIO = sAuthorFIO;
    }

    public String getsMail() {
        return sMail;
    }

    public void setsMail(String sMail) {
        this.sMail = sMail;
    }

    public String getsHead() {
        return sHead;
    }

    public void setsHead(String sHead) {
        this.sHead = sHead;
    }

    public String getsBody() {
        return sBody;
    }

    public void setsBody(String sBody) {
        this.sBody = sBody;
    }

    public Long getnID_Rate() {
        return nID_Rate;
    }

    public void setnID_Rate(Long nID_Rate) {
        this.nID_Rate = nID_Rate;
    }

    public Long getnID_Service() {
        return nID_Service;
    }

    public void setnID_Service(Long nID_Service) {
        this.nID_Service = nID_Service;
    }

    public String getsID_Token() {
        return sID_Token;
    }

    public void setsID_Token(String sID_Token) {
        this.sID_Token = sID_Token;
    }
}
