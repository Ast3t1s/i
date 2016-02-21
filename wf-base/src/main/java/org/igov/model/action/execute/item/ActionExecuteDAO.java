package org.igov.model.action.execute.item;

import java.util.List;

import org.igov.model.core.EntityDao;
import org.joda.time.DateTime;

public interface ActionExecuteDAO extends EntityDao<ActionExecute> {
	
	ActionExecute getActionExecute(Long id);
	List<ActionExecute> getAllActionExecutes();
	Long setActionExecute(Long nID_ActionExecuteStatus, DateTime oDateMake, DateTime oDateEdit, Integer nTry, String sMethod, String soRequest, String smParam, String sReturn);
}
