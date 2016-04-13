﻿(function() {
  'use strict';

  angular
    .module('dashboardJsApp')
    .config(tasksConfig);

  tasksConfig.$inject = ['$stateProvider'];
  function tasksConfig($stateProvider) {
    $stateProvider
      .state('tasks', {
        url: '/tasks',
        controller: 'TasksBaseCtrl',
        access: {
          requiresLogin: true
        },
        templateUrl: 'app/tasks/base.html',
        resolve: {
          tasksStateModel: function () {
            return {};
          },
          stateModel: function () {
            return {
              printTemplate: null,
              taskDefinition: null,
              strictTaskDefinition: null,
              userProcess: null
            }
          },
          processesList: [
            'processes',
            function (processes) {
              return processes.list();
            }
          ],
          userProcesses: [
            'taskFilterService',
            function (taskFilterService) {
              return taskFilterService.getProcesses();
            }
          ]
        }
      })
      .state('tasks.typeof', {
        url: '/:type',
        templateUrl: 'app/tasks/tasks.html',
        controller: 'TasksCtrl',
        access: {
          requiresLogin: true
        }
      })
      .state('tasks.typeof.view', {
        url: '/:id',
        templateUrl: 'app/tasks/taskView.html',
        controller: 'TaskViewCtrl',
        access: {
          requiresLogin: true
        },
        resolve: {
          taskData: [
            'tasks',
            '$stateParams',
            function(tasks, $stateParams) {
              return tasks.getTaskData({nID_Task:$stateParams.id})
            }
          ],
          oTask: [
            'tasks',
            '$stateParams',
            'tasksStateModel',
            '$q',
            function (tasks, $stateParams, tasksStateModel, $q) {
              tasksStateModel.taskId = $stateParams.id;
              if ($stateParams.type == 'finished'){
                var defer = $q.defer();
                tasks.taskFormFromHistory($stateParams.id).then(function(response){
                  defer.resolve(JSON.parse(response).data[0]);
                }, defer.reject);
                return defer.promise;
              }
              else {
                return tasks.getTask($stateParams.id);
              }
            }
          ],
          attachments: [
            'tasks',
            'oTask',
            function (tasks, oTask) {
              return tasks.taskAttachments(oTask.id)
            }
          ],
          orderMessages: [
            'tasks',
            'oTask',
            function (tasks, oTask) {
              return tasks.getOrderMessages(oTask.processInstanceId);
            }
          ],
          taskAttachments: [
            'tasks',
            'oTask',
            function (tasks, oTask) {
              return tasks.getTaskAttachments(oTask.id);
            }
          ],
          taskForm: [
            'oTask',
            'tasks',
            '$q',
            function (oTask, tasks, $q) {
              var defer = $q.defer();
              if (oTask.endTime) {
                tasks.taskFormFromHistory(oTask.id).then(function (result) {
                  defer.resolve(JSON.parse(result).data[0].variables)
                }, defer.reject)
              } else {
                tasks.taskForm(oTask.id).then(function (result) {
                  defer.resolve(JSON.parse(result).formProperties);
                }, defer.reject);
              }
              return defer.promise;
            }
          ]
        }
      });
  }
})();
