package org.igov.io.log;

import java.io.IOException;

import org.igov.io.Log;

public class LogTest {

	//    @Test
	public void logErrorHttp(){
		try {
			throw new IOException("Test service MSG");
		} catch (Exception oException) {
			new Log(this.getClass())
			._Head("[_Send]:nStatus!=200")
			._Status(Log.LogStatus.ERROR)
			._Param("sURL", "http://test.igov.org.ua/wf/service/action/flow/clearFlowSlots?nID_Flow_ServiceData=1&sDateStart=2015-06-01 00:00:00.000&sDateStop=2015-06-07 00:00:00.000")
			._Param("sRequest", "test request")
			._Param("nReturn", "test return")
			._Exception(oException)
			._SendThrow()
			;
		}

	}

}
