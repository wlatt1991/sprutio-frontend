// Generated by CoffeeScript 1.9.3
Ext.define('FM.controller.HomeHandler', {
  extend: 'Ext.app.Controller',
  views: [],
  init: function() {
    FM.Logger.log('HomeHandler init!');
    return this.listen({
      controller: {
        '*': {
          eventHomeInitCallback: 'homeInitCallback',
          eventHomeProcessInit: 'processInit'
        }
      }
    });
  },
  onLaunch: function() {},
  homeInitCallback: function(panels) {
    FM.Logger.log('Event homeInitCallback run in HomeHandler! panels = ', panels);
    return FM.backend.ajaxSend('/actions/home/init_callback', {
      success: (function(_this) {
        return function(response) {
          var response_data;
          response_data = Ext.util.JSON.decode(response.responseText).data;
          return _this.fireEvent(FM.Events.home.processInit, response_data, panels);
        };
      })(this)
    });
  },
  processInit: function(data, panels) {
    FM.Logger.log('Event processInit run in HomeHandler! data = ', data, panels);
    FM.Home = {};
    FM.Home.connections = [];
    if (data.quota != null) {
      FM.Home.quota = data.quota;
      this.processQuota(data.quota, panels);
    }
    if (data.account != null) {
      FM.Home.account = data.account;
      this.processAccount(data.account, panels);
    }
    if (data.connections != null) {
      FM.Home.connections = [];
      this.processConnections(data.connections);
    }
    return this.processFastMenu(data, panels);
  },
  processFastMenu: function(data, panels) {
    var i, len, panel, results;
    FM.Logger.log('processFastMenu() called arguments =', arguments);
    results = [];
    for (i = 0, len = panels.length; i < len; i++) {
      panel = panels[i];
      results.push((function(panel) {
        var connection, connection_menu, fast_menu, home_menu, j, len1, menu_element, ref;
        fast_menu = {
          xtype: 'menu',
          items: []
        };
        home_menu = {
          xtype: 'menuitem',
          text: FM.Actions.HomeFtp.getMenuText(),
          iconCls: FM.Actions.HomeFtp.getIconCls(),
          handler: (function(_this) {
            return function() {
              return FM.Actions.HomeFtp.execute(panel);
            };
          })(this)
        };
        fast_menu.items.push(home_menu);
        if ((data.connections != null) && data.connections.length > 0) {
          menu_element = {
            xtype: 'menuitem',
            text: FM.Actions.RemoteConnections.getMenuText(),
            iconCls: FM.Actions.RemoteConnections.getIconCls(),
            handler: (function(_this) {
              return function() {
                return FM.Actions.RemoteConnections.execute();
              };
            })(this)
          };
          connection_menu = [];
          if (data.connections.length <= 100) {
            ref = data.connections;
            for (j = 0, len1 = ref.length; j < len1; j++) {
              connection = ref[j];
              if (connection.type === 'sftp') {
                (function(connection) {
                  var connection_menu_element;
                  connection_menu_element = {
                    xtype: 'menuitem',
                    text: connection.user + "@" + connection.host,
                    iconCls: 'fm-action-connect-ftp',
                    handler: (function(_this) {
                      return function() {
                        return FM.Actions.OpenRemoteConnection.execute(panel, {
                          type: FM.Session.SFTP,
                          path: '.',
                          server_id: connection.id
                        });
                      };
                    })(this)
                  };
                  return connection_menu.push(connection_menu_element);
                })(connection);
              }
              if (connection.type === 'ftp') {
                (function(connection) {
                  var connection_menu_element;
                  connection_menu_element = {
                    xtype: 'menuitem',
                    text: connection.user + "@" + connection.host,
                    iconCls: 'fm-action-connect-ftp',
                    handler: (function(_this) {
                      return function() {
                        return FM.Actions.OpenRemoteConnection.execute(panel, {
                          type: FM.Session.PUBLIC_FTP,
                          path: '/',
                          server_id: connection.id
                        });
                      };
                    })(this)
                  };
                  return connection_menu.push(connection_menu_element);
                })(connection);
              }
            }
          }
          if (connection_menu.length > 0) {
            menu_element.menu = connection_menu;
          }
          fast_menu.items.push(menu_element);
        }
        return panel.setFastMenu(fast_menu);
      })(panel));
    }
    return results;
  },
  processAccount: function(account, panels) {
    var i, len, login, panel, results, server_name;
    login = account.login != null ? account.login : '';
    server_name = account.server != null ? account.server : '';
    results = [];
    for (i = 0, len = panels.length; i < len; i++) {
      panel = panels[i];
      if (panel.session.type === FM.Session.HOME) {
        results.push(panel.setServerName(login + '@' + server_name));
      } else {
        results.push(void 0);
      }
    }
    return results;
  },
  processConnections: function(connections) {
    FM.Logger.log('processConnections() called arguments =', arguments);
    return FM.Stores.Conenctions.loadData(connections);
  },
  processQuota: function(quota, panels) {
    var all, all_files, file_quota, free, i, len, panel, percent, rounded, rounded_all, rounded_all_files, rounded_files, text, used, used_files, warning;
    FM.Logger.log('processQuota() called arguments =', arguments);
    used = parseInt(quota.blockUsed) / 1024;
    all = parseInt(quota.blockHard) / 1024;
    used_files = parseInt(quota.FileUsed) / 1000;
    all_files = parseInt(quota.FileHard) / 1000;
    free = (all - used) / 1024;
    rounded = (used / 1024).toFixed(2);
    rounded_all = (all / 1000).toFixed(2);
    rounded_files = (used_files / 1000).toFixed(2);
    rounded_all_files = (all_files / 1000).toFixed(2);
    file_quota = false;
    percent = used / all;
    if (all_files !== 0 && all !== 0) {
      if ((used_files / all_files) > (used / all)) {
        file_quota = true;
        percent = used_files / all_files;
      }
    }
    if (all === 0) {
      text = "Без ограничений";
      percent = 0;
    } else if (file_quota) {
      text = "Занято " + rounded_files + "k " + rounded_all_files + "k файлов";
    } else {
      text = "Занято " + rounded + "Гб / " + rounded_all + "Гб";
    }
    warning = false;
    for (i = 0, len = panels.length; i < len; i++) {
      panel = panels[i];
      if (panel.session.type === FM.Session.HOME) {
        panel.setQuota(true, percent, text);
        if (percent > FM.Quota.WARNING_PERCENT) {
          warning = true;
        }
      } else {
        panel.setQuota(false);
      }
    }
    if (warning) {
      if (file_quota) {
        return FM.helpers.ShowWarning(t("Your file quota is almost full. <br/>For this reason some file operations may not work."));
      } else {
        return FM.helpers.ShowWarning(t("Your account quota is almost full. <br/>For this reason some file operations may not work."));
      }
    }
  }
});
