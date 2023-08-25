import {
	JupyterFrontEnd,
	JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

interface APODResponse {
	copyright: string;
	date: string;
	explanation: string;
	media_type: 'video' | 'image';
	title: string;
	url: string;
};

class APODWidget extends Widget {
	/**
	 * Construct a new APOD Widget
	 */
	constructor() {
		super();

		this.addClass('my-APODWiget');

		//Adding an image element to panel
		this.img = document.createElement('img');
		this.node.appendChild(this.img);

		// Adding a summary element to the panel
		this.summary = document.createElement('p');
		this.node.appendChild(this.summary);
	}

	/**
	 * The image element associated with the widget
	 */
	readonly img: HTMLImageElement;

	/**
	 * The summary text element associated with the image
	 */
	readonly summary: HTMLParagraphElement;

	/**
	 * Handling update requests for the widget
	 */
	async updateAPODImage(): Promise<void> {
		const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${this.randomDate()}`);

		if (!response.ok) {
			const data = await response.json();
			if (data.error) {
				this.summary.innerText = data.error.message;
			} else {
				this.summary.innerText = response.statusText;
			}
			return;
		}

		const data = await response.json() as APODResponse;

		if (data.media_type === 'image') {
			// Populating image
			this.img.src = data.url;
			this.img.title = data.title;
			this.summary.innerText = data.title;
			if (data.copyright) {
				this.summary.innerText += ` (Copyright ${data.copyright})`;
			}
		} else {
			this.summary.innerText = 'Random APOD was not a image.';
		}
	}

	/**
	 * Getting a random date string in YYYY-MM-DD format
	 */
	randomDate(): string {
		const start = new Date(2010, 1, 1);
		const end = new Date();
		const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
		return randomDate.toISOString().slice(0, 10);
	}

}

/**
 * Activating the APOD widget extension
 */
function activate(app: JupyterFrontEnd, palette: ICommandPalette) {
	console.log('JupyterLab extension jupyterlab_apod is activated!');

	// Defining a widget creator function and calling it to make a new widget
	const newWidget = () => {
		// Creating a blank content widget inside of MainAreaWidget
		const content = new APODWidget();
		content.addClass('my-apodWidget');
		const widget = new MainAreaWidget({ content });
		widget.id = 'apod-jupyterlab';
		widget.title.label = 'Astronomy Picture';
		widget.title.closable = true;
		return widget;
	}

	// Create a single widget
	let widget = newWidget();

	// Adding an application command
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
			//Refreshing the picture in the widget
			widget.content.updateAPODImage();
			// Activating widget
			app.shell.activateById(widget.id);
		}
	});

	//Adding command to palette
	palette.addItem({ command, category: 'Tutorial' });
}
/**
 * Initialization data for the jupyterlab_apod extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
	id: 'jupyterlab-apod',
	description: 'Show a random NASA Astronomy Picture of the Day in a JupyterLab panel.',
	autoStart: true,
	requires: [ICommandPalette],
	activate: activate
};

export default plugin;
