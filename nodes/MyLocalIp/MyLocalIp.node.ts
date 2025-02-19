import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';
import { MyLocalIpResult } from './models/MyLocalIpResult';
import * as os from 'node:os';
import ip from 'ip';

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
						name: 'Get My Local IP',
						value: 'local_ip',
						description: 'Get my local IP address',
						action: 'Get my local IP',
					},
				],
				default: 'local_ip',
			},
			{
				displayName: 'Network Interface',
				name: 'network_interface',
				type: 'string',
				default: '',
				description: 'Define the network interface',
			},
			{
				displayName: 'Version',
				name: 'version',
				type: 'options',
				required: true,
				options: [
					{
						name: 'IP V4',
						value: 'local_ipv4',
						action: 'Get my local ipv4',
					},
					{
						name: 'IP V6',
						value: 'local_ipv6',
						action: 'Get my local ipv6',
					},
					{
						name: 'Both IP V4/V6',
						value: 'both_ipv4/6',
						action: 'Get my local ipv4/ipv6',
					},
				],
				default: 'local_ipv4',
			},
			{
				displayName: 'Only External IP',
				name: 'only_external_ip',
				type: 'boolean',
				default: false,
				description: 'Get only external IP address',
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
						default: 'local',
						description: 'The name of the output field to put the data in',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		// Parameters & Options
		//const operation = this.getNodeParameter('operation', 0);
		const network_interface = this.getNodeParameter('network_interface', 0) as string;
		const version = this.getNodeParameter('version', 0) as string;
		const only_external_ip = this.getNodeParameter('only_external_ip', 0) as boolean;

		const options = this.getNodeParameter('options', 0);
		const result_field = options.result_field ? (options.result_field as string) : 'local';

		const interfaces = os.networkInterfaces();
		const result: MyLocalIpResult = new MyLocalIpResult();

		for (const interfaceName in interfaces) {
			for (const iface of interfaces[interfaceName]!) {
				if (network_interface == '' || network_interface == interfaceName) {
					if (!only_external_ip || (only_external_ip && !iface.internal)) {
						if (
							version == 'both_ipv4/6' ||
							(version == 'local_ipv4' && iface.family == 'IPv4') ||
							(version == 'local_ipv6' && iface.family == 'IPv6')
						) {
							result.interfaces.push({
								hostname: os.hostname(),
								family: iface.family,
								interface: interfaceName,
								address: iface.address,
								mac: iface.mac,
								internal: iface.internal,
								subnet: ip.subnet(iface.address, iface.netmask),
							});
						}
					}
				}
			}
		}

		items.forEach((item) => (item.json[result_field] = result));

		return [items];
	}
}
