package org.igov.service.business.subject;

import java.util.ArrayList;
import java.util.List;

import org.activiti.engine.IdentityService;
import org.activiti.engine.RepositoryService;
import org.igov.model.subject.SubjectRightBP;
import org.igov.model.subject.SubjectRightBPDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.activiti.engine.identity.Group;
import org.activiti.engine.repository.ProcessDefinition;


@Component("subjectRightBPService")
@Service
public class SubjectRightBPService {

	private static final Logger LOG = LoggerFactory.getLogger(SubjectRightBPService.class);

	@Autowired
	private IdentityService identityService;

	@Autowired
	private RepositoryService oRepositoryService;

	@Autowired
	private SubjectRightBPDao subjectRightBPDao;

	public List<SubjectRightBPVO> getSubjectRightBPs(String sLogin) {

		List<SubjectRightBPVO> aResSubjectRightBPVO = new ArrayList<>();

		List<Group> aGroup = identityService.createGroupQuery().groupMember(sLogin).list();

		List<String> asID_Group = new ArrayList<>();

		if (aGroup != null) {
			aGroup.stream().forEach(group -> asID_Group.add(group.getId()));
		}
		LOG.info("In the method getSubjectRightBPs sLogin={}, asID_Group={}", sLogin, asID_Group);

		List<SubjectRightBP> aSubjectRightBP = subjectRightBPDao.findAllByInValues("sID_Group", asID_Group);
		LOG.info("In the method getSubjectRightBPs aSubjectRightBP {}", aSubjectRightBP);
		
				
		for (SubjectRightBP oSubjectRightBP : aSubjectRightBP) {

			if (oSubjectRightBP != null) {
				String sID_BP = oSubjectRightBP.getsID_BP();
				LOG.info("In the method getSubjectRightBPs oFindedSubjectRightBP {}", oSubjectRightBP.getsID_BP());

				List<ProcessDefinition> aProcessDefinition = oRepositoryService.createProcessDefinitionQuery()
						.processDefinitionKeyLike(sID_BP).active().latestVersion().list();
				String sName_BP = aProcessDefinition.get(0).getName();
				SubjectRightBPVO oSubjectRightBP_VO = new SubjectRightBPVO();

				oSubjectRightBP_VO.setsID_BP(oSubjectRightBP.getsID_BP());
				oSubjectRightBP_VO.setsID_Place_UA(oSubjectRightBP.getsID_Place_UA());
				oSubjectRightBP_VO.setsID_Group(oSubjectRightBP.getsID_Group());;
				oSubjectRightBP_VO.setsName_BP(sName_BP);

				aResSubjectRightBPVO.add(oSubjectRightBP_VO);
			}
			LOG.info("In the method getSubjectRightBPs oSubjectRightBP is null");
		}
		return aResSubjectRightBPVO;
	}
}