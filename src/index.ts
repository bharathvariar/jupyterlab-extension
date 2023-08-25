import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
/**
 * Initialization data for the jupyterlab_apod extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-apod',
  description: 'Show a random NASA Astronomy Picture of the Day in a JupyterLab panel.',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension jupyterlab_apod is activated!');
    
    // Defining a widget creator function and calling it to make a new widget
    const newWidget = () => {
      // Create a blank content widget inside of MainAreaWidget
      const content = new Widget();
      const widget = new MainAreaWidget({ content });
      widget.id = 'apod-jupyterlab';
      widget.title.label = 'Astronomy Picture';
      widget.title.closable = true;
      return widget;
    }
    let widget = newWidget();

    // Adding application command\
    const command: string = 'apod: open';
    app.commands.addCommand(command, {
      label: 'Random Astronomy Picture',
      execute: () => {
        // Regenerate widget if disposed
        if (widget.isDisposed) {
          widget = newWidget();
        }
        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, 'main');
        }
        // Activating widget
        app.shell.activateById(widget.id);
      }
    });

    //Adding command to palette
    palette.addItem({ command, category: 'Tutorial' });
  }
};

export default plugin;
