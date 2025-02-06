import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { ShellUtils } from './utils/ShellUtils';
import { IfConfigUtils } from './utils/IfConfigUtils';

export class MyLocalIp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'My Local Ip',
		name: 'myLocalIp',
		icon: 'file:MyLocalIpLogo.svg',
		group: ['output'],
		version: 1,
		triggerPanel: false,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Get my local IP address',
		defaults: {
			name: 'My Local Ip',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get My Local IP Address',
						value: 'local_ipv4',
						description: 'Get my local IP address (ifconfig -a &lt;interface&gt;)',
						action: 'Get my local IP address',
					},
				],
				default: 'local_ipv4',
			},
			{
				displayName: 'Network Interface',
				name: 'network_interface',
				type: 'string',
				default: '',
				description: 'Define the network interface',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				options: [
					{
						displayName: 'Put Result in Field',
						name: 'result_field',
						type: 'string',
						default: 'local_ip',
						description: 'The name of the output field to put the data in',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let item: INodeExecutionData;
		const returnItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			item = { ...items[itemIndex] };
			const newItem: INodeExecutionData = {
				json: item.json,
				pairedItem: {
					item: itemIndex,
				},
			};

			// Parameters & Options
			const operation = this.getNodeParameter('operation', itemIndex);
			const network_interface = this.getNodeParameter('network_interface', itemIndex) as string;
			const options = this.getNodeParameter('options', itemIndex);
			const result_field = options.result_field ? (options.result_field as string) : 'local_ip';

			let command: string = `ifconfig -a ${network_interface}`;

			console.log(`Command starting ${command}`);

			const shellUtils = new ShellUtils();
			const ifConfigUtils = new IfConfigUtils();

			const workingDirectory = await shellUtils.resolveHomeFolder('~/');
			console.log(workingDirectory);

			await shellUtils
				.command(command, workingDirectory)
				.then((output) => {
					console.log(`Command done ${command}`);

					if (operation === 'local_ipv4') {
						newItem.json[result_field] = ifConfigUtils.parseIfConfigIpv4(output);
						returnItems.push(newItem);
					}
				})
				.catch((e) => {
					throw new NodeOperationError(this.getNode(), e);
				});
		}

		return [returnItems];
	}
}
