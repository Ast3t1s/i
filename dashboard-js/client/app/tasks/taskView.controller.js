(function () {
  'use strict';

  angular
    .module('dashboardJsApp')
    .controller('TaskViewCtrl', [
      '$scope', '$stateParams', 'oTask', 'PrintTemplateService', 'MarkersFactory', 'tasks', 'attachments',
      'orderMessages', 'taskAttachments', 'taskForm', 'iGovNavbarHelper', 'Modal', 'Auth', 'defaultSearchHandlerService',
      '$state',
      function ($scope, $stateParams, oTask, PrintTemplateService, MarkersFactory, tasks, attachments,
                orderMessages, taskAttachments, taskForm, iGovNavbarHelper, Modal, Auth, defaultSearchHandlerService,
                $state) {
        var defaultErrorHandler = function (response, msgMapping) {
          defaultSearchHandlerService.handleError(response, msgMapping);
          if ($scope.taskForm) {
            $scope.taskForm.isSuccessfullySubmitted = false;
            $scope.taskForm.isInProcess = false;
          }
        };

        $scope.printTemplateList = [];
        $scope.model.printTemplate = null;

        $scope.taskForm = null;
        $scope.attachments = null;
        $scope.aOrderMessage = null;
        $scope.error = null;
        $scope.taskAttachments = null;
        $scope.clarify = false;
        $scope.clarifyFields = {};
        $scope.sSelectedTask = $stateParams.type;
        $scope.selectedTask = oTask;
        $scope.taskId = oTask.id;
        $scope.nID_Process = oTask.processInstanceId;

        $scope.attachments = JSON.parse(attachments);

        $scope.aOrderMessage = JSON.parse(orderMessages);
        angular.forEach($scope.aOrderMessage, function (message) {
          if (message.hasOwnProperty('sData') && message.sData.length > 1) {
            message.osData = JSON.parse(message.sData);
          }
        });

        $scope.taskAttachments = taskAttachments;


        var addIndexForFileItems = function (val) {
          var idx = 0;
          return (val || []).map(function (item) {
            if (item.type === 'file') {
              item.nFileIdx = idx;
              idx++;
            }
            return item;
          });
        };

        var setTaskForm = function (formProperties) {
          // change "enum" field to "string" (issue # 751)
          var aTempFormProperties = formProperties;
          for(var i = 0; i < formProperties.length; i++){
            if (aTempFormProperties[i].type === "enum" && isItemFormPropertyDisabled(aTempFormProperties[i])){
              formProperties[i].type = "string";
              for(var j = 0; j < aTempFormProperties[i].enumValues.length; j++){
                if(aTempFormProperties[i].value === aTempFormProperties[i].enumValues[j].id){
                  formProperties[i].value = aTempFormProperties[i].enumValues[j].name;
                }
              }
            }
          }
          $scope.taskForm = formProperties;
          $scope.taskForm = addIndexForFileItems($scope.taskForm);
          $scope.printTemplateList = PrintTemplateService.getTemplates($scope.taskForm);
          if ($scope.printTemplateList.length > 0) {
            $scope.model.printTemplate = $scope.printTemplateList[0];
          }
          if ($scope.selectedTask) {
            tasks.getTaskData({nID_Task: $scope.selectedTask.id}).then(function (taskData) {
              $scope.taskForm.taskData = taskData;
            });
          }

          // autofocus on searched task
          if (iGovNavbarHelper.tasksSearch.autofocusOnTask) {
            var oHtmlDomTasksList = document.getElementById("tasks-list");
            var aHtmlDomTasks = oHtmlDomTasksList.getElementsByTagName("a");
            var oHtmlDomTaskActive;
            for (var i = 0, max = aHtmlDomTasks.length; i < max; i++) {
              var el = aHtmlDomTasks.item(i);
              var elClassName = el.getAttribute("class");
              if (elClassName.search("active") != -1) {
                oHtmlDomTaskActive = el;
                break;
              }
            }
            oHtmlDomTaskActive.scrollIntoView(true);
            iGovNavbarHelper.tasksSearch.autofocusOnTask = false;
          }
        };

        function isItemFormPropertyDisabled(oItemFormProperty){
          if (!($scope.selectedTask && $scope.selectedTask !== null)) {
            return true;
          }
          if ($scope.selectedTask.assignee === null) {
            return true;
          }
          if ($scope.sSelectedTask === null) {
            return true;
          }
          if (oItemFormProperty === null) {
            return true;
          }
          if ($scope.sSelectedTask === 'finished') {
            return true;
          }
          var sID_Field = oItemFormProperty.id;
          if (sID_Field === null) {
            return true;
          }
          if (!oItemFormProperty.writable) {
            return true;
          }
          //var bNotBankID =
          var bEditable = sID_Field.indexOf("bankId") !== 0;
          var sFieldName = oItemFormProperty.name;
          if (sFieldName === null) {
            return true;
          }
          var as = sFieldName.split(";");
          if (as.length > 2) {
            bEditable = as[2] === "writable=true" ? true : as[2] === "writable=false" ? false : bEditable;
          }

          return !bEditable;
        }

        setTaskForm(taskForm);

        if (!oTask.endTime) {
          $scope.taskForm.forEach(function (field) {
            if (field.type === 'markers' && $.trim(field.value)) {
              var sourceObj = null;
              try {
                sourceObj = JSON.parse(field.value);
              } catch (ex) {
                console.log('markers attribute ' + field.name + ' contain bad formatted json\n' + ex.name + ', ' + ex.message + '\nfield.value: ' + field.value);
              }
              if (sourceObj !== null) {
                _.merge(MarkersFactory.getMarkers(), sourceObj, function (destVal, sourceVal) {
                  if (_.isArray(sourceVal)) {
                    return sourceVal;
                  }
                });
              }
            }
          });
        }

        $scope.isRequired = function (item) {
          return !$scope.isFormPropertyDisabled(item) && (item.required || $scope.isCommentAfterReject(item)); //item.writable
        };

        $scope.isTaskSubmitted = function (item) {
          return $scope.taskForm.isSubmitted;
        };

        $scope.isTaskSuccessfullySubmitted = function () {
          if ($scope.selectedTask && $scope.taskForm) {
            if ($scope.taskForm.isSuccessfullySubmitted != undefined && $scope.taskForm.isSuccessfullySubmitted)
              return true;
          }
          return false;
        };

        $scope.isTaskInProcess = function () {
          if ($scope.selectedTask && $scope.taskForm) {
            if ($scope.taskForm.isInProcess != undefined && $scope.taskForm.isInProcess)
              return true;
          }
          return false;
        };

        $scope.clarify = false;

        $scope.clarifyToggle = function () {
          $scope.clarify = !$scope.clarify;
        };

        $scope.clarifyModel = {
          sBody: ''
        };

        $scope.clarifySend = function () {

          var oData = {
            nID_Process: $scope.nID_Process,
            saField: '',
            soParams: '',
            sMail: '',
            sBody: $scope.clarifyModel.sBody
          };

          var soParams = {sEmployerFIO: $scope.getCurrentUserName};
          var aFields = [];
          var sClientFIO = null;
          var sClientName = null;
          var sClientSurname = null;

          angular.forEach($scope.taskForm, function (item) {
            if (angular.isDefined($scope.clarifyFields[item.id]) && $scope.clarifyFields[item.id].clarify)
              aFields.push({
                sID: item.id,
                sName: $scope.sFieldLabel(item.name),
                sType: item.type,
                sValue: item.value,
                sValueNew: item.value,
                sNotify: $scope.clarifyFields[item.id].text
              });

            if (item.id === 'email') {
              oData.sMail = item.value;
            }
            //<activiti:formProperty id="bankIdfirstName" name="Ім'я" type="string" ></activiti:formProperty>
            //<activiti:formProperty id="bankIdmiddleName" name="По Батькові" type="string" ></activiti:formProperty>
            if (item.id === 'bankIdfirstName') {
              sClientName = item.value;
            }
            if (item.id === 'bankIdmiddleName') {
              sClientSurname = item.value;
            }
          });

          if ($scope.clarifyModel.sBody.trim().length === 0 && aFields.length === 0) {
            Modal.inform.warning()('Треба ввести коментар або обрати поле/ля');
            return;
          }


          if (sClientName !== null) {
            sClientFIO = sClientName;
            if (sClientSurname !== null) {
              sClientFIO += " " + sClientSurname;
            }
          }
          if (sClientFIO !== null) {
            soParams["sClientFIO"] = sClientFIO;
          }

          oData.saField = JSON.stringify(aFields);
          oData.soParams = JSON.stringify(soParams);
          tasks.setTaskQuestions(oData).then(function () {
            $scope.clarify = false;
            Modal.inform.success(function () {
            })('Зауваження відправлено успішно');
          });
        };

        $scope.checkSignState = {inProcess: false, show: false, signInfo: null, attachmentName: null};

        $scope.checkAttachmentSign = function (nID_Task, nID_Attach, attachmentName) {
          $scope.checkSignState.inProcess = true;
          tasks.checkAttachmentSign(nID_Task, nID_Attach).then(function (signInfo) {
            if (signInfo.customer) {
              $scope.checkSignState.show = !$scope.checkSignState.show;
              $scope.checkSignState.signInfo = signInfo;
              $scope.checkSignState.attachmentName = attachmentName;
            } else if (signInfo.code) {
              $scope.checkSignState.show = false;
              $scope.checkSignState.signInfo = null;
              $scope.checkSignState.attachmentName = null;
              Modal.inform.warning()(signInfo.message);
            } else {
              $scope.checkSignState.show = false;
              $scope.checkSignState.signInfo = null;
              $scope.checkSignState.attachmentName = null;
              Modal.inform.warning()('Немає підпису');
            }
          }).catch(function (error) {
            $scope.checkSignState.show = false;
            $scope.checkSignState.signInfo = null;
            $scope.checkSignState.attachmentName = null;
            Modal.inform.error()(error.message);
          }).finally(function () {
            $scope.checkSignState.inProcess = false;
          });
        };

        $scope.isFormPropertyDisabled = function (formProperty) {
          /*
          if (!($scope.selectedTask && $scope.selectedTask !== null)) {
            return true;
          }
          if ($scope.selectedTask.assignee === null) {
            return true;
          }
          if ($scope.sSelectedTask === null) {
            return true;
          }
          if (formProperty === null) {
            return true;
          }
          if ($scope.sSelectedTask === 'finished') {
            return true;
          }
          var sID_Field = formProperty.id;
          if (sID_Field === null) {
            return true;
          }
          if (!formProperty.writable) {
            return true;
          }
          var bNotBankID = sID_Field.indexOf("bankId") !== 0;
          var bEditable = bNotBankID;
          var sFieldName = formProperty.name;
          if (sFieldName === null) {
            return true;
          }
          var as = sFieldName.split(";");
          if (as.length > 2) {
            bEditable = as[2] === "writable=true" ? true : as[2] === "writable=false" ? false : bEditable;
          }

          return !bEditable;
          */
          return isItemFormPropertyDisabled(formProperty);
        };

        $scope.print = function () {
          if ($scope.selectedTask && $scope.taskForm) {
            if ($scope.hasUnPopulatedFields()) {
              Modal.inform.error()('Не всі поля заповнені!');
              return;
            }
            $scope.printModalState.show = !$scope.printModalState.show;
          }
        };

        $scope.hasUnPopulatedFields = function () {
          if ($scope.selectedTask && $scope.taskForm) {
            var unpopulated = $scope.taskForm.filter(function (item) {
              return (item.value === undefined || item.value === null || item.value.trim() === "") && (item.required || $scope.isCommentAfterReject(item));//&& item.type !== 'file'
            });
            return unpopulated.length > 0;
          } else {
            return true;
          }
        };

        $scope.unpopulatedFields = function () {
          if ($scope.selectedTask && $scope.taskForm) {
            var unpopulated = $scope.taskForm.filter(function (item) {
              return (item.value === undefined || item.value === null || item.value.trim() === "") && (item.required || $scope.isCommentAfterReject(item));//&& item.type !== 'file'
            });
            return unpopulated;
          } else {
            return [];
          }
        };

        $scope.submitTask = function () {
          if ($scope.selectedTask && $scope.taskForm) {
            $scope.taskForm.isSubmitted = true;

            var unpopulatedFields = $scope.unpopulatedFields();
            if (unpopulatedFields.length > 0) {
              var errorMessage = 'Будь ласка, заповніть поля: ';

              if (unpopulatedFields.length == 1) {

                var nameToAdd = unpopulatedFields[0].name;
                if (nameToAdd.length > 50) {
                  nameToAdd = nameToAdd.substr(0, 50) + "...";
                }

                errorMessage = "Будь ласка, заповніть полe '" + nameToAdd + "'";
              }
              else {
                unpopulatedFields.forEach(function (field) {

                  var nameToAdd = field.name;
                  if (nameToAdd.length > 50) {
                    nameToAdd = nameToAdd.substr(0, 50) + "...";
                  }
                  errorMessage = errorMessage + "'" + nameToAdd + "',<br />";
                });
                var comaIndex = errorMessage.lastIndexOf(',');
                errorMessage = errorMessage.substr(0, comaIndex);
              }
              Modal.inform.error()(errorMessage);
              return;
            }

            $scope.taskForm.isInProcess = true;

            tasks.submitTaskForm($scope.selectedTask.id, $scope.taskForm, $scope.selectedTask)
              .then(function (result) {
                var sMessage = "Форму відправлено.";
                angular.forEach($scope.taskForm, function (oField) {
                  if (oField.id === "sNotifyEvent_AfterSubmit") {
                    sMessage = oField.value;
                  }
                });


                Modal.inform.success(function (result) {
                  $scope.lightweightRefreshAfterSubmit();
                })(sMessage + " " + (result && result.length > 0 ? (': ' + result) : ''));

              })
              .catch(defaultErrorHandler);
          }
        };

        $scope.assignTask = function () {
          $scope.taskForm.isInProcess = true;

          tasks.assignTask($scope.selectedTask.id, Auth.getCurrentUser().id)
            .then(function (result) {
              Modal.assignTask(function (event) {
                $state.go('tasks.typeof.view', {type:'selfAssigned'});
              }, 'Задача у вас в роботі', $scope.lightweightRefreshAfterSubmit);

            })
            .catch(defaultErrorHandler);
        };

        $scope.upload = function (files, propertyID) {
          tasks.upload(files, $scope.taskId).then(function (result) {
            var filterResult = $scope.taskForm.filter(function (property) {
              return property.id === propertyID;
            });
            if (filterResult && filterResult.length === 1) {
              filterResult[0].value = result.response.id;
              filterResult[0].fileName = result.response.name;
            }
          }).catch(function (err) {
            Modal.inform.error()('Помилка. ' + err.code + ' ' + err.message);
          });
        };

        $scope.lightweightRefreshAfterSubmit = function () {
          //lightweight refresh only deletes the submitted task from the array of current type of tasks
          //so we don't need to refresh the whole page
          iGovNavbarHelper.loadTaskCounters();
          $scope.taskForm.isInProcess = false;
          $scope.taskForm.isSuccessfullySubmitted = true;
        };

        $scope.sFieldLabel = function (sField) {
          var s = '';
          if (sField !== null) {
            var a = sField.split(';');
            s = a[0].trim();
          }
          return s;
        };

        $scope.nID_FlowSlotTicket_FieldQueueData = function (sValue) {
          var nAt = sValue.indexOf(":");
          var nTo = sValue.indexOf(",");
          var s = sValue.substring(nAt + 1, nTo);
          var nID_FlowSlotTicket = 0;
          try {
            nID_FlowSlotTicket = s;
          } catch (_) {
            nID_FlowSlotTicket = 1;
          }
          return nID_FlowSlotTicket;
        };

        $scope.sDate_FieldQueueData = function (sValue) {
          var nAt = sValue.indexOf("sDate");
          var nTo = sValue.indexOf("}");
          var s = sValue.substring(nAt + 5 + 1 + 1 + 1, nTo - 1 - 6);
          var sDate = "Дата назначена!";
          try {
            sDate = s;
          } catch (_) {
            sDate = "Дата назначена!";
          }
          return sDate;
        };

        $scope.sEnumValue = function (aItem, sID) {
          var s = sID;
          _.forEach(aItem, function (oItem) {
            if (oItem.id == sID) {
              s = oItem.name;
            }
          });
          return s;
        };

        $scope.getMessageFileUrl = function (oMessage, oFile) {
          return './api/tasks/' + $scope.nID_Process + '/getMessageFile/' + oMessage.nID + '/' + oFile.sFileName;
        };

        $scope.getCurrentUserName = function () {
          var user = Auth.getCurrentUser();
          return user.firstName + ' ' + user.lastName;
        };

        $scope.isCommentAfterReject = function (item) {
          if (item.id != "comment") return false;

          var decision = $.grep($scope.taskForm, function (e) {
            return e.id == "decide";
          });

          if (decision.length == 0) {
            // no decision
          } else if (decision.length == 1) {
            if (decision[0].value == "reject") return true;
          }
          return false;
        };
      }
    ]);
})();
