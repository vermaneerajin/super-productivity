/**
 * @ngdoc directive
 * @name superProductivity.directive:themeSettings
 * @description
 * # themeSettings
 */

(function() {
  'use strict';

  angular
    .module('superProductivity')
    .directive('themeSettings', themeSettings);

  /* @ngInject */
  function themeSettings() {
    return {
      templateUrl: 'scripts/settings/theme-settings/theme-settings-d.html',
      bindToController: true,
      controller: ThemeSettingsCtrl,
      controllerAs: 'vm',
      restrict: 'E',
      scope: {
        currentTheme: '=',
        isCurrentProjectTheme: '@',
        isBoxed: '<'
      }
    };
  }

  /* @ngInject */
  function ThemeSettingsCtrl($scope, THEMES, DEFAULT_THEME, $rootScope, EV_PROJECT_CHANGED) {
    let vm = this;
    vm.themes = THEMES;

    // workarounds required to make data model work with theming engine of ng-material
    function cleanupThemeVars() {
      // wait for var to be there
      $scope.$evalAsync(() => {

        vm.currentTheme = vm.currentTheme || DEFAULT_THEME;
        vm.isDarkTheme = vm.currentTheme && vm.currentTheme.indexOf('dark') > -1;
        vm.selectedTheme = vm.currentTheme && vm.currentTheme
          .replace('-theme', '')
          .replace('-dark', '');
      });
    }

    cleanupThemeVars();

    // WATCHER & EVENTS
    // ----------------
    const watchers = [];

    watchers.push($scope.$watch('vm.selectedTheme', function(value) {
      if (value) {
        if (vm.isDarkTheme) {
          vm.currentTheme = value + '-dark';
        } else {
          vm.currentTheme = value + '-theme';
        }

        if (!vm.isBoxed) {
          $rootScope.r.theme = vm.currentTheme;
        }
      }
    }));

    watchers.push($scope.$watch('vm.isDarkTheme', function(value) {
      if (vm.currentTheme) {
        if (value) {
          vm.currentTheme = vm.currentTheme.replace('-theme', '-dark');
          if (vm.isCurrentProjectTheme) {
            if (!vm.isBoxed) {
              $rootScope.r.bodyClass = 'dark-theme';
            }
          }
        } else {
          vm.currentTheme = vm.currentTheme.replace('-dark', '-theme');
          if (vm.isCurrentProjectTheme) {
            if (!vm.isBoxed) {
              $rootScope.r.bodyClass = '';
            }
          }
        }
        // for some reason project needs to be updated directly
        if (vm.isCurrentProjectTheme) {
          if (vm.currentTheme.currentProject && vm.currentTheme.currentProject.data) {
            vm.currentTheme.currentProject.data.theme = vm.currentTheme;
          }
        }

        if (!vm.isBoxed) {
          $rootScope.r.theme = vm.currentTheme;
        }
      }
    }));

    $scope.$on(EV_PROJECT_CHANGED, () => {
      // currentTheme is not updated right away, because it is a primitive,
      // that's why we set it here from the rootScope
      vm.currentTheme = $rootScope.r.theme;
      cleanupThemeVars();
    });

    $scope.$on('$destroy', () => {
      // remove watchers manually
      _.each(watchers, (watcher) => {
        watcher();
      });
    });
  }

})();
