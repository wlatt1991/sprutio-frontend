// Generated by CoffeeScript 1.9.3
Ext.define('FM.controller.MainHandler', {
  extend: 'Ext.app.Controller',
  views: [],
  init: function() {
    FM.Logger.log('MainHandler init!');
    return this.listen({
      controller: {
        '*': {
          eventMainRestoreSession: 'restoreSession',
          eventMainSaveSession: 'saveSession',
          eventMainInitSession: 'initSession',
          eventMainLoadSettings: 'loadSettings',
          eventMainSaveSettings: 'saveSettings',
          eventMainSelectPanel: 'selectPanel',
          eventMainSelectFiles: 'selectFiles'
        }
      }
    });
  },
  onLaunch: function() {},
  loadSettings: function(data) {
    FM.Logger.log('Event loadSettings run in MainHandler! data = ', arguments);
    if (data.editor_settings != null) {
      FM.Editor.settings = data.editor_settings;
    }
    if (data.viewer_settings != null) {
      return FM.Viewer.settings = data.viewer_settings;
    }
  },
  selectFiles: function(panel, files) {
    FM.Logger.log('Event selectFiles run in MainHandler! data = ', arguments);
    FM.panels.Top.updateButtonsState(panel, files);
    FM.panels.Top.updateMenuState(panel, files);
    return FM.panels.Bottom.updateState(panel, files);
  },
  selectPanel: function(panel, files) {
    FM.Logger.log('Event selectPanel run in MainHandler! data = ', arguments);
    FM.panels.Top.updateButtonsState(panel, files);
    FM.panels.Top.updateMenuState(panel, files);
    return FM.panels.Bottom.updateState(panel, files);
  },
  saveSession: function(panels) {
    var i, len, panel;
    FM.Logger.log('Event saveSession run in MainHandler! data = ', arguments);
    for (i = 0, len = panels.length; i < len; i++) {
      panel = panels[i];
      if (panel.session.type === FM.Session.LOCAL_APPLET) {
        return;
      }
      FM.backend.ajaxSend('/actions/main/save_session', {
        params: {
          session: panel.session,
          order: panel.toString()
        },
        success: (function(_this) {
          return function(response) {
            var response_data;
            response_data = Ext.util.JSON.decode(response.responseText).data;
            return FM.Logger.info('Session saved ', response_data, panel);
          };
        })(this),
        failure: (function(_this) {
          return function(response) {
            FM.Logger.debug(response);
            FM.helpers.ShowError(t("Unable to save session state.<br/> Please contact support."));
            return FM.Logger.error(response);
          };
        })(this)
      });
    }
  },
  restoreSession: function(data) {
    FM.Logger.log('Event restoreSession run in MainHandler! data = ', data, FM.Left);
    FM.helpers.SetLoading(FM.Right.body, t("Loading..."));
    FM.helpers.SetLoading(FM.Left.body, t("Loading..."));
    FM.backend.ajaxSend('/actions/main/load_settings', {
      success: (function(_this) {
        return function(response) {
          var response_data;
          response_data = Ext.util.JSON.decode(response.responseText).data;
          return _this.fireEvent(FM.Events.main.loadSettings, response_data);
        };
      })(this),
      failure: function(response) {
        FM.Logger.debug(response);
        FM.helpers.ShowError(t("Unable to load settings.<br/> Please contact support."));
        return FM.Logger.error(response);
      }
    });
    if (!data.restore) {
      FM.backend.ajaxSend('/actions/main/init_session', {
        success: (function(_this) {
          return function(response) {
            var listing, response_data;
            response_data = Ext.util.JSON.decode(response.responseText).data;
            listing = response_data.listing;
            if (listing.path !== '/') {
              listing.items.unshift({
                name: "..",
                is_dir: true
              });
            }
            return _this.fireEvent(FM.Events.main.initSession, response_data, [FM.Right, FM.Left]);
          };
        })(this),
        failure: function(response) {
          FM.helpers.UnsetLoading(FM.Left.body);
          FM.helpers.UnsetLoading(FM.Right.body);
          FM.Logger.debug(response);
          FM.helpers.ShowError(t("Unable to restore session state.<br/> Please contact support."));
          return FM.Logger.error(response);
        }
      });
    }
    if (data.restore) {
      if (data.same) {
        return FM.backend.ajaxSend('/actions/main/init_session', {
          params: {
            session: data.session.Left
          },
          success: (function(_this) {
            return function(response) {
              var listing, response_data;
              response_data = Ext.util.JSON.decode(response.responseText).data;
              listing = response_data.listing;
              if (listing.path !== '/') {
                listing.items.unshift({
                  name: "..",
                  is_dir: true
                });
              }
              return _this.fireEvent(FM.Events.main.initSession, response_data, [FM.Right, FM.Left]);
            };
          })(this),
          failure: (function(_this) {
            return function(response) {
              FM.Logger.debug(response);
              FM.Logger.error(response);
              return _this.initDefaultSession([FM.Right, FM.Left]);
            };
          })(this)
        });
      } else {
        FM.backend.ajaxSend('/actions/main/init_session', {
          params: {
            session: data.session.Left
          },
          success: (function(_this) {
            return function(response) {
              var listing, response_data;
              response_data = Ext.util.JSON.decode(response.responseText).data;
              listing = response_data.listing;
              if (listing.path !== '/') {
                listing.items.unshift({
                  name: "..",
                  is_dir: true
                });
              }
              return _this.fireEvent(FM.Events.main.initSession, response_data, [FM.Left]);
            };
          })(this),
          failure: (function(_this) {
            return function(response) {
              FM.Logger.debug(response);
              FM.Logger.error(response);
              return _this.initDefaultSession([FM.Left]);
            };
          })(this)
        });
        return FM.backend.ajaxSend('/actions/main/init_session', {
          params: {
            session: data.session.Right
          },
          success: (function(_this) {
            return function(response) {
              var listing, response_data;
              response_data = Ext.util.JSON.decode(response.responseText).data;
              listing = response_data.listing;
              if (listing.path !== '/') {
                listing.items.unshift({
                  name: "..",
                  is_dir: true
                });
              }
              return _this.fireEvent(FM.Events.main.initSession, response_data, [FM.Right]);
            };
          })(this),
          failure: (function(_this) {
            return function(response) {
              FM.Logger.debug(response);
              FM.Logger.error(response);
              return _this.initDefaultSession([FM.Right]);
            };
          })(this)
        });
      }
    }
  },
  initDefaultSession: function(panels) {
    return FM.backend.ajaxSend('/actions/main/init_session', {
      success: (function(_this) {
        return function(response) {
          var listing, response_data;
          response_data = Ext.util.JSON.decode(response.responseText).data;
          listing = response_data.listing;
          if (listing.path !== '/') {
            listing.items.unshift({
              name: "..",
              is_dir: true
            });
          }
          return _this.fireEvent(FM.Events.main.initSession, response_data, panels);
        };
      })(this),
      failure: function(response) {
        var i, len, panel;
        for (i = 0, len = panels.length; i < len; i++) {
          panel = panels[i];
          FM.helpers.UnsetLoading(panel.body);
        }
        FM.Logger.debug(response);
        FM.helpers.ShowError(t("Unable to restore session state.<br/> Please contact support."));
        return FM.Logger.error(response);
      }
    });
  },
  initSession: function(data, panels) {
    var button, i, len, panel;
    FM.Logger.log('Event initSession run in MainHandler! data = ', data, panels);
    for (i = 0, len = panels.length; i < len; i++) {
      panel = panels[i];
      panel.session = Ext.ux.Util.clone(data.session);
      panel.actions = Ext.ux.Util.clone(data.actions);
      if (panel === FM.Active) {
        FM.panels.Top.updateButtonsState(panel, []);
        FM.panels.Top.updateMenuState(panel, []);
        FM.panels.Bottom.updateState(panel, []);
      }
      panel.filelist.initStore(data.listing);
      if (panel.session.host != null) {
        panel.setServerName(panel.session.host);
      } else {
        panel.setServerName('');
      }
      button = panel.getFastMenuButton();
      if (panel.session.type === FM.Session.HOME) {
        button.setConfig({
          text: FM.Actions.HomeFtp.getMenuText(),
          iconCls: FM.Actions.HomeFtp.getIconCls()
        });
      }
      if (panel.session.type === FM.Session.PUBLIC_FTP) {
        button.setConfig({
          text: FM.Actions.RemoteConnections.getMenuText(),
          iconCls: FM.Actions.RemoteConnections.getIconCls()
        });
      }
      if (panel.session.type === FM.Session.SFTP) {
        button.setConfig({
          text: FM.Actions.RemoteConnections.getMenuText(),
          iconCls: FM.Actions.RemoteConnections.getIconCls()
        });
      }
      if (panel.session.type === FM.Session.LOCAL_APPLET) {
        button.setConfig({
          text: FM.Actions.Local.getMenuText(),
          iconCls: FM.Actions.Local.getIconCls()
        });
      }
    }
    this.fireEvent(FM.Events.home.homeInitCallback, panels);
    return this.fireEvent(FM.Events.main.saveSession, panels);
  },
  saveSettings: function(data) {
    var editor, editors, i, j, len, len1, results, viewer, viewers;
    FM.Logger.log('Event saveSettings run in MainHandler! data = ', data);
    FM.Editor.settings = data.editor_settings;
    FM.Viewer.settings = data.viewer_settings;
    editors = Ext.ComponentQuery.query("editor-window");
    viewers = Ext.ComponentQuery.query("viewer-window");
    for (i = 0, len = editors.length; i < len; i++) {
      editor = editors[i];
      editor.updateSettings();
    }
    results = [];
    for (j = 0, len1 = viewers.length; j < len1; j++) {
      viewer = viewers[j];
      results.push(viewer.updateSettings());
    }
    return results;
  }
});
