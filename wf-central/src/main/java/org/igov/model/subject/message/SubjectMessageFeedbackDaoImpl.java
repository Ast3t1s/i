package org.igov.model.subject.message;

import com.google.common.base.Optional;
import org.igov.model.core.GenericEntityDao;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.igov.service.controller.ActionEventController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Repository
public class SubjectMessageFeedbackDaoImpl extends GenericEntityDao<Long, SubjectMessageFeedback> implements SubjectMessageFeedbackDao {
private static final Logger LOG = LoggerFactory.getLogger(ActionEventController.class);
    protected SubjectMessageFeedbackDaoImpl() {
        super(SubjectMessageFeedback.class); 
    }

    @Override
    public SubjectMessageFeedback save(SubjectMessageFeedback subjectMessageFeedback) {
        getSession().save(subjectMessageFeedback);
        return subjectMessageFeedback;
    }

    @Override
    public SubjectMessageFeedback getSubjectMessageFeedbackById(Long nId) {
        Optional<SubjectMessageFeedback> feedback = findById(nId);
        if (feedback.isPresent()) {
          return feedback.get();
        }
        return null;
    }

    @Override
    public List<SubjectMessageFeedback> getAllSubjectMessageFeedbackBynID_Service(Long nID_service) {
        return findAllBy("nID_Service", nID_service);
    }

    @Override
    public SubjectMessageFeedback update(SubjectMessageFeedback subjectMessageFeedback) {
        getSession().update(subjectMessageFeedback);
        return subjectMessageFeedback;
    }

    @Override
    public List<SubjectMessageFeedback> findByOrder(String sID_Order) {
    List<SubjectMessageFeedback> findAll = findAllBy("sID_Order", sID_Order);
    LOG.info("sID_Order: "+sID_Order);
        return findAllBy("sID_Order", sID_Order); 
    }

    @Override
    public String setsID_Order(String sID_Order) {
       return toString();
    }
}
