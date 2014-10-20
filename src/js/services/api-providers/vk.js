angular.module('App')
  .service('PS_vk', ['$modal', '$rootScope', '__vkAppId', function($modal, $rootScope, __vkAppId) {

    var service = {};

    var userInfo = {};

    function call(method, options, callback) {
      options = $.extend({
        v: 5.23
      }, options);
      VK.Api.call(method, options, function(resp) {
        if (resp.response) {
          if (typeof callback === 'function') {
            callback(resp);
          }
        } 

        if (resp.error && resp.error.error_code === 14) {
          var sid = resp.error.captcha_sid;
          $modal.open({
            templateUrl: 'templates/modals/vkCaptcha.html',
            controller: 'Cm_vkCaptcha as ctr',
            size: 'sm',
            resolve: {
              imageUrl: function() {
                return resp.error.captcha_img;
              }
            }
          }).result.then(function(code) {
            call(method, angular.extend(options,{
              captcha_key: code,
              captcha_sid: sid
            }), callback);
          });
        }

      });
    }

    service.call = function(method, options, callback) {
      call(method, options, callback);
    }

    function afterAuth(resp) {
      if (resp.session) {
        VK.Api.call('users.get', {
          fields: 'photo_50'
        }, function(r) {
          var id = r.response[0].uid;
          var name = r.response[0].first_name + ' ' + r.response[0].last_name;
          var photo = r.response[0].photo_50;


          userInfo = {
            id: id,
            name: name,
            photo: photo
          }

          $rootScope.$broadcast('userLogin', userInfo);
        });
      } else {
        $rootScope.$broadcast('badAuthorization');
      }
    }

    service.getUserInfo = function(){

    }

    service.init = function() {
      VK.init({
        apiId: __vkAppId
      });
    }

    service.authorize = function() {
      VK.Auth.login(function() {
        VK.Auth.getLoginStatus(afterAuth);
      }, VK.access.AUDIO + 262144);
    }


    service.intro = function() {
      VK.Auth.getLoginStatus(function(resp) {
        afterAuth(resp);
      });
    }

    service.get = function(options) {
      options = $.extend({
        count: 10,

      }, options);
      VK.Api.call('audio.get', {
        count: 50,
        offset: that.offset,
        v: 5
      }, function(f) {
        if (f.response) {
          var q = f.response;
          if (q.items.length > 0) {
            console.log(q.items);
          }

        }

      });
    }

    service.findTrackArray = function(array, callback, lastCallback) {

      var parallelSearch = 5;


      var l = array.length;

      var executeCount = Math.ceil(l / parallelSearch);
      var executeIndex = 0;


      function execute() {
        var code = '';
        var start = executeIndex * parallelSearch;
        for (var i = start; i < (start + parallelSearch); i++) {
          var el = array[i];
          if (!el) {
            break;
          }
          if (code != '')
            code += ',';
          code += parserVkSearchRequest(el.artist, el.title);
        }

        code = 'return [' + code + '];';


        service.call('execute', {
            code: code
          },
          function(resp) {
            executeIndex++;
            callback(resp, start);
            console.log(resp);
            if (executeIndex < executeCount) {
              setTimeout(execute, 1000);
            } else {
              lastCallback();
            }
          }
        );
      }
      execute();

    }

    service.search = function(options, callback) {
      options = $.extend({
        auto_complete: 1,
        lyrics: 0,
        performer_only: 0,
        sort: 2,
        search_own: 1,
        offset: 0,
        count: 50,
        v: 5.23
      }, options);
      VK.Api.call('audio.search', options, function(resp) {
        if (resp.response) {
          if (typeof callback === 'function') {
            callback(resp);
          }
        }

      });
    }

    function parserVkSearchRequest(artist, title) {
      return 'API.audio.search({"q":"' + artist + ' ' + title + '","count": 10})';
    }


    return service;
  }]);
