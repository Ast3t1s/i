angular.module('about').config(function ($stateProvider, statesRepositoryProvider) {
  statesRepositoryProvider.init(window.location.host);
//  if (statesRepositoryProvider.isCentral()) {
    $stateProvider
      .state('index.about', {
        url: 'about',
        resolve: {
          title: function (TitleChangeService) {
            TitleChangeService.defaultTitle();
          }
        },
        views: {
          'main@': {
            templateUrl: 'app/about/about.html',
            controller: 'ServiceHistoryReportController'
          }
        }
      })
      .state('index.test', {
        url: 'test',
        views: {
          'main@': {
            templateUrl: 'app/about/test.html',
            controller: 'TestController'
          }
        }
      });
//  }
});

angular.module('about').controller('aboutController', function ($scope, $http) {

    var volunteers = [
        {
          "sGroup": {
            "sID" : "main",
            "sName" : "IT-волонтери iGov",
            "type" : [{
              "sName" : "TOP волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Белявцев Владимир",
          "sURL":"https://www.facebook.com/profile.php?id=100001410629235",
          "sPhoto" : "https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/11057271_968842949839383_8290049245673140145_n.jpg?oh=d41f1a6305b3ce826d5e291fe8f22406&oe=585CCD55",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "main",
            "sName" : "IT-волонтери iGov",
            "type" : [{
              "sName" : "TOP волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Дубилет Дмитрий",
          "sURL":"https://www.facebook.com/dubilet",
          "sPhoto" : "https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/11406895_10153457089428552_7046977239850441618_n.jpg?oh=da0b48378043d6a27b385ec916710239&oe=5857AFE6",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "main",
            "sName" : "IT-волонтери iGov",
            "type" : [{
              "sName" : "TOP волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Туренко (Кузьминова) Ольга",
          "sURL":"https://www.linkedin.com/in/olga-turenko-65860999",
          "sPhoto" : "https://media.licdn.com/mpr/mpr/shrinknp_200_200/p/8/005/0a3/010/2873119.jpg",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "main",
            "sName" : "IT-волонтери iGov",
            "type" : [{
              "sName" : "TOP волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Шимкив Дмитрий",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "main",
            "sName" : "IT-волонтери iGov",
            "type" : [{
              "sName" : "TOP волонтери iGov",
              "region" : [{
                "sName": "Київська область",
                "city" : [
                  {
                    "sID":"kyiv_kyiv",
                    "sName": "Київ",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersURL":""
                  },
                  {
                    "sID":"kyiv_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Мерило Яника",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/c1.0.160.160/p160x160/10620554_10204503241759783_5791407653897428363_n.jpg?oh=c75d263d5ab1d1f920b42d4aa10b9e9c&oe=585B9330",
          "sURL":"",
          "sCity":"Київ"
        },
        {
          "sGroup": {
            "sID" : "main",
            "sName" : "IT-волонтери iGov",
            "type" : [{
              "sName" : "TOP волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Курбацкий Павел",
          "sURL":"https://www.facebook.com/kyrbatsky",
          "sPhoto" : "https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/14948_717710254976581_8444143412921572127_n.jpg?oh=eadeb8ea15640de0d90ec54477e6737e&oe=582A0FB6",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "main",
            "sName" : "IT-волонтери iGov",
            "type" : [{
              "sName" : "TOP волонтери iGov",
              "region" : [{
                "sName": "Тернопільська область",
                "city" : [
                  {
                    "sID":"ternopil_ternopil",
                    "sName": "Тернопіль",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"ternopil_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Кельнер Ирина",
          "sURL":"",
          "sCity":"Тернопіль"
        },
        {
          "sGroup": {
            "sID" : "main",
            "sName" : "IT-волонтери iGov",
            "type" : [{
              "sName" : "TOP волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Заболотний Дмитрий",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "main",
            "sName" : "IT-волонтери iGov",
            "type" : [{
              "sName" : "TOP волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Домаш Алексей",
          "sPhoto":"https://avatars2.githubusercontent.com/u/1484619?v=3&s=460",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "main",
            "sName" : "IT-волонтери iGov",
            "type" : [{
              "sName" : "TOP волонтери iGov",
              "region" : [{
                "sName": "Київська область",
                "city" : [
                  {
                    "sID":"kyiv_kyiv",
                    "sName": "Київ",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersURL":""
                  },
                  {
                    "sID":"kyiv_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Вадим Волос",
          "sURL":"https://www.facebook.com/vadymvolos",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/c27.0.160.160/p160x160/969077_563076740410432_913138478_n.jpg?oh=5816e4ea9ae61095dbd571ae33763ada&oe=581E1A89",
          "sCity":"Київ"
        },
        {
          "sGroup": {
            "sID" : "main",
            "sName" : "IT-волонтери iGov",
            "type" : [{
              "sName" : "TOP волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Боровик Дмитрий",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Київська область",
                "city" : [
                  {
                    "sID":"kyiv_kyiv",
                    "sName": "Київ",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersURL":""
                  },
                  {
                    "sID":"kyiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Руднев Вадим",
          "sURL":"",
          "sCity":"Київ"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Боборицкий Денис",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Київська область",
                "city" : [
                  {
                    "sID":"kyiv_kyiv",
                    "sName": "Київ",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersURL":""
                  },
                  {
                    "sID":"kyiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Кащенко Александр",
          "sURL":"",
          "sCity":"Київ"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Гулич Вадим",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Харківська область",
                "city" : [
                  {
                    "sID":"kharkiv_kharkiv",
                    "sName": "Харків",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"kharkiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Большуткин Владимир",
          "sURL":"",
          "sCity":"Харків"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Львівська область",
                "city" : [
                  {
                    "sID":"lviv_chervonograd",
                    "sName": "Червоноград",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"chervonograd_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Квасній Артур",
          "sURL":"",
          "sCity":"Червоноград"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Корчагин Павел",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Одеська область",
                "city" : [
                  {
                    "sID":"odesa_odesa",
                    "sName": "Одеса",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"odesa_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Сафроненков Андрей",
          "sURL":"",
          "sCity":"Одеса"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Будник Дмитрий",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Ладик Денис",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              },
                {
                  "sName": "Інші регіони",
                  "city" : [
                    {
                      "sID":"oter_polish",
                      "sName": "Польша",
                      "sCityPassportURL":"",
                      "sNewsGroupURL":"",
                      "sVolunteersGroupURL":""
                    },
                    {
                      "sID":"polish_volunteer",
                      "sName": "Волонтер"
                    }
                  ]
                }
              ]
            }]
          },
          "sFIO":"Терещенко Максим",
          "sURL":"",
          "sCity":"Дніпро / Польша"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Миколаївська область",
                "city" : [
                  {
                    "sID":"mykolaiv_mykolaiv",
                    "sName": "Миколаїв",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"mykolaiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              },
                {
                  "sName": "Київcька область",
                  "city": [
                    {
                      "sID": "kyiv_kyiv",
                      "sName": "Київ",
                      "sCityPassportURL":"",
                      "sNewsGroupURL":"",
                      "sVolunteersURL":""
                    },
                    {
                      "sID": "kyiv_volunteer",
                      "sName": "Волонтер"
                    }
                  ]
                }
              ]
            }]
          },
          "sFIO":"Великотский Вячеслав",
          "sURL":"",
          "sCity":"Миколаїв / Київ"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Одеська область",
                "city" : [
                  {
                    "sID":"odesa_odesa",
                    "sName": "Одеса",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"odesa_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Лупашко Богдан",
          "sURL":"",
          "sCity":"Одеса"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Воронюк Евгений",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Миколаївська область",
                "city" : [
                  {
                    "sID":"mykolaiv_mykolaiv",
                    "sName": "Миколаїв",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"mykolaiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Лущан Владислав",
          "sURL":"",
          "sCity":"Миколаїв"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Феденишин Андрей",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Харківська область",
                "city" : [
                  {
                    "sID":"kharkiv_kharkiv",
                    "sName": "Харків",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"kharkiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              },
                {
                  "sName": "Львівська область",
                  "city" : [
                    {
                      "sID":"lviv_lviv",
                      "sName": "Львів",
                      "sCityPassportURL":"",
                      "sNewsGroupURL":"",
                      "sVolunteersGroupURL":""
                    },
                    {
                      "sID":"lviv_volunteer",
                      "sName": "Волонтер"
                    }
                  ]
                }]
            }]
          },
          "sFIO":"Глеб Жебраков",
          "sURL":"",
          "sCity":"Харків / Львів"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Макаренко Валерий",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Дашенко Инни",
          "sURL":"",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Харківська область",
                "city" : [
                  {
                    "sID":"kharkiv_kharkiv",
                    "sName": "Харків",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"kharkiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Педич Максим",
          "sURL":"",
          "sCity":"Харків"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Київська область",
                "city" : [
                  {
                    "sID":"kyiv_kyiv",
                    "sName": "Київ",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersURL":""
                  },
                  {
                    "sID":"kyiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Зора Борис",
          "sURL":"",
          "sCity":"Київ"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Львівська область",
                "city" : [
                  {
                    "sID":"lviv_lviv",
                    "sName": "Львів",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"lviv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Янов Андрей",
          "sURL":"",
          "sCity":"Львів"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Чернігівська область",
                "city" : [
                  {
                    "sID":"chernigiv_chernigiv",
                    "sName": "Чернігів",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"chernigiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Дубина Владимир",
          "sURL":"",
          "sCity":"Чернігів"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Миколаївська область",
                "city" : [
                  {
                    "sID":"mykolaiv_mykolaiv",
                    "sName": "Миколаїв",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"mykolaiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Жмурков Александр",
          "sURL":"",
          "sCity":"Миколаїв"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Донецька область",
                "city" : [
                  {
                    "sID":"donetsk_donetsk",
                    "sName": "Донецьк",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"donetsk_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              },
                {
                  "sName": "Одеська область",
                  "city" : [
                    {
                      "sID":"odesa_odesa",
                      "sName": "Одеса",
                      "sCityPassportURL":"",
                      "sNewsGroupURL":"",
                      "sVolunteersGroupURL":""
                    },
                    {
                      "sID":"odesa_volunteer",
                      "sName": "Волонтер"
                    }
                  ]
                }]
            }]
          },
          "sFIO":"Соловьев Александр",
          "sURL":"https://ua.linkedin.com/in/%D0%B0%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80-%D1%81%D0%BE%D0%BB%D0%BE%D0%B2%D1%8C%D0%B5%D0%B2-a2108085",
          "sPhoto":"https://media.licdn.com/mpr/mpr/shrinknp_200_200/p/7/005/059/1eb/2db7911.jpg",
          "sCity":"Донецьк, Одеса"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Сумська область",
                "city" : [
                  {
                    "sID":"sumy_sumy",
                    "sName": "Суми",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"sumy_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Дубинка Юрій",
          "sURL":"https://ua.linkedin.com/pub/yurii-dubinka/b9/16/45b",
          "sPhoto":"https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAALQAAAAJDY1YWIxNGRlLTEyZmItNGY4OC1iOWIxLWFlYTFjOTQ3MWU5Nw.jpg",
          "sCity":"Суми"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Чернігівська область",
                "city" : [
                  {
                    "sID":"chernigiv_chernigiv",
                    "sName": "Чернігів",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"chernigiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Голуб Олексій",
          "sURL":"",
          "sCity":"Чернігів"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Львівська область",
                "city" : [
                  {
                    "sID":"lviv_lviv",
                    "sName": "Львів",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"lviv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              },
                {
                  "sName": "Інші регіони",
                  "city" : [
                    {
                      "sID":"other_krakiv",
                      "sName": "Краків",
                      "sCityPassportURL":"",
                      "sNewsGroupURL":"",
                      "sVolunteersGroupURL":""
                    },
                    {
                      "sID":"krakiv_volunteer",
                      "sName": "Волонтер"
                    }
                  ]
                }]
            }]
          },
          "sFIO":"Гуцуляк Олександр",
          "sURL":"",
          "sCity":"Львів / Краків"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Чернігівська область",
                "city" : [
                  {
                    "sID":"chernigiv_chernigiv",
                    "sName": "Чернігів",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"chernigiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Олександр Скосир",
          "sURL":"",
          "sCity":"Чернігів"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Сумська область",
                "city" : [
                  {
                    "sID":"sumy_sumy",
                    "sName": "Суми",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"sumy_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Олексій Сердюк",
          "sURL":"",
          "sCity":"Суми"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Житомирська область",
                "city" : [
                  {
                    "sID":"zhytomyr_zhytomyr",
                    "sName": "Житомир",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"zhytomyr_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Ольга Прилипко",
          "sURL":"",
          "sCity":"Житомир"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Київська область",
                "city" : [
                  {
                    "sID":"kyiv_kyiv",
                    "sName": "Київ",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersURL":""
                  },
                  {
                    "sID":"kyiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Майданюк Дмитро",
          "sURL":"",
          "sCity":"Київ"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Туренко Сергей",
          "sURL":"https://www.linkedin.com/in/sergey-turenko-b8708a94",
          "sPhoto":"https://media.licdn.com/mpr/mpr/shrinknp_200_200/p/7/005/0a3/012/1f8218c.jpg",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Волобуев Дмитрий",
          "sURL":"https://www.facebook.com/profile.php?id=100007298923596&fref=ts",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/13230318_1706937276226220_178858746065393251_n.jpg?oh=8588f01290a823de793b63d9ca488b19&oe=5818D6EC",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Горбань Сергей",
          "sURL":"https://github.com/sergeygorban",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Марченко Игорь",
          "sURL":"https://github.com/djekildp",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Жиган Роман",
          "sURL":"https://www.facebook.com/roman.zhigan.1",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/11891155_1482232562095454_7875554608302750847_n.jpg?oh=00f42b7f50927134427a36381867078c&oe=5854A23F",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Грек Дарья",
          "sURL":"https://www.facebook.com/darja.grek",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/12046987_969763873087888_5887983526328644721_n.jpg?oh=ccdc6260583f719fa7f61ff1b13ab31b&oe=5824EFAC",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Свидрань Максим",
          "sURL":"https://www.facebook.com/maksim.svidran",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/c0.40.160.160/p160x160/1655880_10203085452998391_1162874664_n.jpg?oh=8979ec2ee3494428820cfd8e2a434ea9&oe=5824A775",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Забрудский Дмитрий",
          "sURL":"https://www.facebook.com/dmitrij.zabrudskij",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/c37.56.465.465/s160x160/48134_10201214484668290_1678936328_n.jpg?oh=776e6b7d79db6671ebfd1e7dd673cdc1&oe=582393CE",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Смоктий Кирилл",
          "sURL":"https://www.facebook.com/smoktii",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/12933003_567888636711685_9122203894998038314_n.jpg?oh=2f60ddab0abb663ddb2ae7b4af823cd1&oe=58126829",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Продан Юлія",
          "sURL":"https://www.facebook.com/klimkovichy",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/10268438_1477001455911660_5539510016470161228_n.jpg?oh=3791f2651b792617423001a164cfa986&oe=581F4D6A",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Столбова Анна",
          "sURL":"https://www.facebook.com/insanniyou",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/1743652_594673260603466_1655652539_n.jpg?oh=57bdc0968e8b24ffc6b83a6eaf1bcb0d&oe=5823E139",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Герман Август",
          "sURL":"https://www.facebook.com/profile.php?id=100005136618550",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Золотова Татьяна",
          "sURL":"https://www.facebook.com/agraell",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Дніпропетровська область",
                "city" : [
                  {
                    "sID":"dnipro_dnipro",
                    "sName": "Дніпро",
                    "sCityPassportURL":"http://gorod.dp.ua/",
                    "sNewsGroupURL":"https://www.facebook.com/igov.org.ua/",
                    "sVolunteersGroupURL":"http://economics.unian.ua/other/1361375-ukrajinski-it-volonteri-zapustili-7-novih-poslug-na-sayti-igov.html"
                  },
                  {
                    "sID":"dnipro_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Куліш Андрій",
          "sURL":"https://www.facebook.com/andriy.kylish",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/c28.28.352.352/s160x160/421576_111660178962768_1443552158_n.jpg?oh=da3c9218fcc6b4a34980b32009f3ac24&oe=5829C6E1",
          "sCity":"Дніпро"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Харківська область",
                "city" : [
                  {
                    "sID":"kharkiv_kharkiv",
                    "sName": "Харків"
                  },
                  {
                    "sID":"kharkiv_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Ставицький Валерій",
          "sURL":"https://www.facebook.com/valery.stavitsky",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/11224861_870685936332468_2045742132617793708_n.jpg?oh=1b29b4b5d3d9047fc949a7fa671c7153&oe=5812E599",
          "sCity":"Харків"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Тернопільська область",
                "city" : [
                  {
                    "sID":"ternopil_ternopil",
                    "sName": "Тернопіль",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"ternopil_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Данілевич Софія",
          "sURL":"https://www.facebook.com/sophia.danylevich",
          "sCity":"Тернопіль"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Івано-Франківська область",
                "city" : [
                  {
                    "sID":"ivano-frankivsk_ivano-frankivsk",
                    "sName": "Івано-Франківськ",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"ivano-frankivsk_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Озорович Андрій",
          "sURL":"https://www.facebook.com/a.ozorovych",
          "sCity":"Івано-Франківськ"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Київська область",
                "city" : [
                  {
                    "sID":"kyiv_vyshgorod",
                    "sName": "Вишгород",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"vyshgorod_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Сокиржинський Олександр",
          "sURL":"https://www.facebook.com/alex.sokirjinskiy",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/13092069_1028917970489685_2653187308818494451_n.jpg?oh=5388c4c374e7365b2230af346eb68876&oe=582491CD",
          "sCity":"Вишгород"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Черкаська область",
                "city" : [
                  {
                    "sID":"cherkasy_cherkasy",
                    "sName": "Черкаси",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"cherkasy_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Глибочко Олександр",
          "sURL":"https://www.facebook.com/AlexanderGlybo",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/12928395_1163331457033988_678737066450901642_n.jpg?oh=51454d57b8aa2c33eff91e6d2d1543cc&oe=58163A65",
          "sCity":"Черкаси"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Полтавська область",
                "city" : [
                  {
                    "sID":"poltava_myrgorod",
                    "sName": "Миргород",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"myrgorod_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Слємзін Олександр",
          "sURL":"https://www.facebook.com/alexandr.slemzin",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/c27.0.160.160/p160x160/13269_10205607206771207_8344419548296787003_n.jpg?oh=fabef51ac001b6f626726d5f6ca0d2ee&oe=5855E1E9",
          "sCity":"Миргород"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Рівненська область",
                "city" : [
                  {
                    "sID":"rivne_varash",
                    "sName": "Вараш",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"varash_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Поремчук Євгеній",
          "sURL":"https://www.facebook.com/e.poremchuk?fref=ts",
          "sCity":"Вараш"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Київська область",
                "city" : [
                  {
                    "sID":"kyiv_kyiv",
                    "sName": "Київ",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersURL":""
                  },
                  {
                    "sID":"kyiv_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Шарапов Єгор",
          "sURL":"https://www.facebook.com/egorsha",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/c0.10.160.160/p160x160/1966850_10203490579085516_348411029_n.jpg?oh=7a30398a86e7b0cddcfd23a7ca13238d&oe=581915B3",
          "sCity":"Київ"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Сумська область",
                "city" : [
                  {
                    "sID":"sumy_gluhiv",
                    "sName": "Глухів",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"gluhiv_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Павловець Ілля",
          "sURL":"https://www.facebook.com/Freedom.hl",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/10955798_832812253442342_8854510801972688533_n.jpg?oh=c0c7f062f3e78d9960bb31fda11f47c9&oe=5820C928",
          "sCity":"Глухів"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Одеська область",
                "city" : [
                  {
                    "sID":"odesa_odesa",
                    "sName": "Одеса",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"odesa_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Юрченко Роман",
          "sURL":"https://www.facebook.com/iroyur?fref=ts",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/12308646_839362439509936_8503452484623107341_n.jpg?oh=ff3e189508953adc99011562674c0ccf&oe=58208485",
          "sCity":"Одеса"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Херсонська область",
                "city" : [
                  {
                    "sID":"kherson_kherson",
                    "sName": "Херсон",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"kherson_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Кулик Павло",
          "sURL":"https://www.facebook.com/kylikpavel",
          "sCity":"Херсон"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Київська область",
                "city" : [
                  {
                    "sID":"bucha_bucha",
                    "sName": "Буча",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"bucha_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Лисенко Іван",
          "sURL":"https://www.facebook.com/Lysenko.Ivan",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/10441011_939516459428532_3278611361190235130_n.jpg?oh=fa81c99c8c17200f4744b59ef5cdcb19&oe=585B76A5",
          "sCity":"Буча"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Запорізька область",
                "city" : [
                  {
                    "sID":"zaporizhya_zaporizhya",
                    "sName": "Запоріжжя",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"zaporizhya_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Соловйов Максим",
          "sURL":"https://www.facebook.com/maksim.solovyov.12",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/c0.0.160.160/p160x160/1654480_462168640578627_1688838187_n.jpg?oh=ee1aa15df9961314f5c04ac2deca8cbe&oe=58589B6B",
          "sCity":"Запоріжжя"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Луганська область",
                "city" : [
                  {
                    "sID":"lugansk_severodonetsk",
                    "sName": "Сєвєродонецьк",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"severodonetsk_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Малеванець Олексій",
          "sURL":"https://www.facebook.com/malevanec",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/13938389_1072424572833636_7000621191111350534_n.jpg?oh=243827ba07364e597756c121af22c903&oe=581B1239",
          "sCity":"Сєвєродонецьк"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Сумська область",
                "city" : [
                  {
                    "sID":"sumy_sumy",
                    "sName": "Суми",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"sumy_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Горкуша Михайло",
          "sURL":"https://www.facebook.com/mgorkusha",
          "sCity":"Суми"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Львівська область",
                "city" : [
                  {
                    "sID":"lviv_lviv",
                    "sName": "Львів",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"lviv_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Стець Ольга",
          "sURL":"https://www.facebook.com/olga.kuk.7?fref=ts",
          "sCity":"Львів"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Київська область",
                "city" : [
                  {
                    "sID":"kyiv_bila-tserkva",
                    "sName": "Біла Церква",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"bila-tserkva_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Лаврусь Павел",
          "sURL":"https://www.facebook.com/p.lavrus",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/12196019_522416387923078_4001051597931043315_n.jpg?oh=b61b518dbef7bf4d63248767b51e5b3a&oe=5854F567",
          "sCity":"Біла Церква"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Житомирська область",
                "city" : [
                  {
                    "sID":"zhytomyr_zhytomyr",
                    "sName": "Житомир",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"zhytomyr_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Савінова Ванда",
          "sURL":"https://www.facebook.com/profile.php?id=100001353020712",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/12803084_999314373456987_4051702712675174187_n.jpg?oh=796ae04bcda575f63867384f11ae4808&oe=58241C1B",
          "sCity":"Житомир"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Черкаська область",
                "city" : [
                  {
                    "sID":"cherkasy_cherkasy",
                    "sName": "Черкаси",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"cherkasy_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Дячок Дарина",
          "sURL":"https://www.facebook.com/profile.php?id=100004683825896",
          "sCity":"Черкаси"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Закарпатська область",
                "city" : [
                  {
                    "sID":"zakarpattya_uzhgorod",
                    "sName": "Ужгород",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"uzhgorod_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Лук'янчук Микола",
          "sURL":"https://www.facebook.com/profile.php?id=100007826441900",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/11146563_1588005888136944_6434735988339732415_n.jpg?oh=bc8600b3151428674798075dc1eb9c7e&oe=58286C47",
          "sCity":"Ужгород"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Житомирська область",
                "city" : [
                  {
                    "sID":"zhytomyr_zhytomyr",
                    "sName": "Житомир",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"zhytomyr_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Корнійчук Володимир",
          "sURL":"https://www.facebook.com/profile.php?id=100010892283159",
          "sCity":"Житомир"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Черкаська область",
                "city" : [
                  {
                    "sID":"cherkasy_cherkasy",
                    "sName": "Черкаси",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"cherkasy_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Колодіч Олена",
          "sURL":"https://www.facebook.com/profile.php?id=100011166150937",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/12540537_103723173343221_6396342699887234434_n.jpg?oh=13586283b1cc4c2cb3983891028b0296&oe=582026E4",
          "sCity":"Черкаси"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Рівненська область",
                "city" : [
                  {
                    "sID":"rivne_ostrog",
                    "sName": "Острог",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"ostrog_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Галич Сергій",
          "sURL":"https://www.facebook.com/serhiy.halich",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/11903710_1016467491743026_2145437931467083079_n.jpg?oh=cd457b4bc836e270fb9f3a89082691fe&oe=5813239B",
          "sCity":"Острог"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Луганська область",
                "city" : [
                  {
                    "sID":"lugansk_novopskov",
                    "sName": "Новопсков",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"novopskov_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Малетин Виктор",
          "sURL":"https://www.facebook.com/v.maletin",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/c170.50.621.621/s160x160/314832_161708137251710_572795340_n.jpg?oh=1281bc05c206e60ce5130bdee326c731&oe=58566C61",
          "sCity":"Новопсков"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Вінницька область",
                "city" : [
                  {
                    "sID":"vinnytsia_vinnytsia",
                    "sName": "Вінниця",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"vinnytsia_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Мукомол Вадим",
          "sURL":"https://www.facebook.com/vadim.munin",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/13322177_1128005340575202_2101175329914658142_n.jpg?oh=5f1cc91ede0ea2075becc8e315b435f4&oe=5818D3A5",
          "sCity":"Вінниця"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Хмельницька область",
                "city" : [
                  {
                    "sID":"khmelnytskiy_khmelnytskiy",
                    "sName": "Хмельницький",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"khmelnytskiy_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Вербицький Олександр",
          "sURL":"https://www.facebook.com/verbitsky.aleks",
          "sCity":"Хмельницький"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Івано-Франківська область",
                "city" : [
                  {
                    "sID":"ivano-frankivsk_kalush",
                    "sName": "Калуш",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"kalush_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Маліборський Віталій",
          "sURL":"https://www.facebook.com/weres.ua",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/12144677_439030329635978_6939953702971035626_n.jpg?oh=d5032677cc3f4997ed2658a1cdd0ab38&oe=582818AD",
          "sCity":"Калуш"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Полтавська область",
                "city" : [
                  {
                    "sID":"poltava_poltava",
                    "sName": "Полтава",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"poltava_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Городчаніна Юлія",
          "sURL":"https://www.facebook.com/yuliya.bobir",
          "sCity":"Полтава"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Хмельницька область",
                "city" : [
                  {
                    "sID":"khmelnytskiy_khmelnytskiy",
                    "sName": "Хмельницький",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"khmelnytskiy_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Пляцик Юрій",
          "sURL":"https://www.facebook.com/yura.plyacik",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/13537696_1156377111049092_6910064597484651978_n.jpg?oh=0016c0346f7df21238e551d4867182f8&oe=58285ABB",
          "sCity":"Хмельницький"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Рівненська область",
                "city" : [
                  {
                    "sID":"rivne_rivne",
                    "sName": "Рівне",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"rivne_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Дюг Юрій",
          "sURL":"https://www.facebook.com/yuriy.dyug",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/10923531_1000018706694178_455606146826939393_n.jpg?oh=92dd846cda22cb5df1c9bd86efbb6131&oe=5822EDA5",
          "sCity":"Рівне"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Київська область",
                "city" : [
                  {
                    "sID":"kyiv_makarov",
                    "sName": "Макаров",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"makarov_rada",
                    "sName": "Рада волонтерів"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Татьяна Гончарова",
          "sURL":"https://www.facebook.com/tanja.goncharova",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/c0.41.160.160/p200x200/11891269_952001978206576_6268696842288680632_n.jpg?oh=19929ba17c9fa69635b0fbf1d76bc6a2&oe=58163EB2",
          "sCity":"Макаров"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Інші регіони",
                "city" : [
                  {
                    "sID":"other_zurich",
                    "sName": "Цюріх",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"zurich_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Самсонюк Юрій",
          "sURL":"",
          "sCity":"Цюріх"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Інші регіони",
                "city" : [
                  {
                    "sID":"other_singapore",
                    "sName": "Сингапур",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"singapore_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Московцов Даниил",
          "sURL":"",
          "sCity":"Сингапур"
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Інші регіони",
                "city" : [
                  {
                    "sID":"other_other",
                    "sName": "",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"other_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Яценко Антон",
          "sURL":"",
          "sCity":""
        },
        {
          "sGroup": {
            "sID" : "region",
            "sName" : "Регіональні Волонтери iGov",
            "type" : [{
              "sName" : "Регіональні волонтери iGov",
              "region" : [{
                "sName": "Інші регіони",
                "city" : [
                  {
                    "sID":"copenhagen_copenhagen",
                    "sName": "Копенгаген",
                    "sCityPassportURL":"",
                    "sNewsGroupURL":"",
                    "sVolunteersGroupURL":""
                  },
                  {
                    "sID":"copenhagen_volunteer",
                    "sName": "Волонтер"
                  }
                ]
              }]
            }]
          },
          "sFIO":"Катерина Бутенко",
          "sURL":"https://www.facebook.com/ekaterina.butenko",
          "sPhoto":"https://scontent-frt3-1.xx.fbcdn.net/v/t1.0-1/p160x160/10888637_1009507575729643_6435584388863763113_n.jpg?oh=095e9eeef3fbe35039473674d2976a2f&oe=5825C574",
          "sCity":"Копенгаген"
        }
      ];

    var top = [];
    var region = [];
    var sortedVol = [];
    var city = [];
    var volList = [];
    angular.forEach(volunteers, function (volunteer) {
      if(volunteer.sGroup.sID === "main") {
        top.push(volunteer);
      } else if (volunteer.sGroup.sID === "region") {
        region.push(volunteer);
      }

    });
    angular.forEach(region, function (volunteer) {
      var found = false;
      for(var i = 0; i < sortedVol.length; ++i) {
        if (sortedVol[i][0].regionName === volunteer.sGroup.type[0].region[0].sName) {
          sortedVol[i].push(volunteer);
          found = true;
          break;
        }
      }
      if (!found && volunteer.sGroup.type[0].region[0].sName != "") {
        sortedVol.push([{regionName : volunteer.sGroup.type[0].region[0].sName}, volunteer]);
      }
    });

    angular.forEach(sortedVol, function (volunteers) {
      volunteers.cities = [];
        angular.forEach(volunteers, function (volunteer) {
        var found = false;
        for(var i = 0; i < city.length; ++i) {
          if (city[i][0].cityName === volunteer.sGroup.type[0].region[0].city[0].sName) {
            city[i].push(volunteer);
            found = true;
            break;
          }
        }

        if (!found && volunteer.sGroup && volunteer.sGroup.type[0].region[0].city[0].sID != "") {
          city.push([{cityName : volunteer.sGroup.type[0].region[0].city[0].sName}, volunteer]);
        } else if(!found && volunteer.regionName) {
            city.push([{regionName : volunteer.regionName}])
        }
      });
      volList.push(city);
      city = [];
    });
    $scope.topVolunteers = top;
    $scope.regionVolunteers = volList;

  $scope.checkForEmpty = function () {
    var el = document.querySelectorAll('.content-ul');
    for(var i=0; i<el.length; i++) {
      if(el[i].childElementCount === 0) {
        el[i].parentNode.style.display = 'none'
      } else {
        el[i].parentNode.style.display = 'block'
      }
    }
  };
});
