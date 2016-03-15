angular.module('app').controller('FooterController', function ($scope) {
  $scope.adsset = [
    {
      url: 'http://contact-call.com',
      alt: 'contact-call',
      image: 'assets/images/ads/contactcall.png',
      height: 50
    }
    ,{
      url: 'http://www.de-novo.biz/uk',
      alt: 'de-novo',
      image: 'assets/images/ads/denovo.png',
      height: 50
    }
    
    ,{
      url: 'http://www.promarmatura.ua',
      alt: 'promarmatura',
      image: 'assets/images/ads/promarmatura.png',
      height: 50
    }
    ,{
      url: 'http://nic.ua',
      alt: 'nicua',
      image: 'assets/images/ads/nicua.png',
      height: 50
    }
    ,{
      url: 'http://work.ua',
      alt: 'workua',
      image: 'assets/images/ads/workua.png',
      height: 50
    }
    ,{
      url: 'http:/templatemonster.com',
      alt: 'template',
      image: 'assets/images/ads/template.png',
      height: 50
    }
    ,{
      url: 'http://dou.ua',
      alt: 'dou',
      image: 'assets/images/ads/dou.png',
      height: 50
    }
    ,{
      url: 'http://bdo.com.ua',
      alt: 'bdo',
      image: 'assets/images/ads/bdo.jpg',
      height: 50
    }
    ,{
      url: 'http://dimakovpak.com',
      alt: 'kovpak',
      image: 'assets/images/ads/kovpak.png',
      height: 50
    }
    ,{
      url: 'http://avante.com.ua',
      alt: 'avante',
      image: 'assets/images/ads/avante.jpg',
      height: 50
    }
    ,{
      url: 'http://ukr.net',
      alt: 'ukrnet',
      image: 'assets/images/ads/ukrnet.png',
      height: 50
    }
    ,{
      url: 'https://www.fabrikant.ua',
      alt: 'fabrikant',
      image: 'assets/images/ads/fabrikant.png',
      height: 50
    }
    ,{
      url: 'http://www.lun.ua',
      alt: 'lun',
      image: 'assets/images/ads/lun.png',
      height: 50
    }
    ,{
      url: 'http://www.rbt.te.ua',
      alt: 'ternopil',
      image: 'assets/images/ads/ternopil.png',
      height: 50
    }
    ,{
      url: 'https://www.facebook.com/3bobra',
      alt: 'tribobra',
      image: 'assets/images/ads/tribobra.png',
      height: 50
    }
    
  ];

  function randomizeIndexes(indexes, item, arr) {
    var result = true;
    var count = 100;
    var sortid;
    do {
      sortid = Math.floor(Math.random() * arr.length);
    } while (indexes.includes(sortid) && count-- > 0);

    indexes.push(sortid);
    item.sortid = sortid;

    return result;
  }

  var indexes = [];
  $scope.adsset.forEach(function (item, i, arr) {
    randomizeIndexes(indexes, item, arr);
  });

  $scope.adsset.sort(function (a, b) {
    return a.sortid - b.sortid;
  });
});
