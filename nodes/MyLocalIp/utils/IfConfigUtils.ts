import { IDataObject } from 'n8n-workflow';

export class IfConfigUtils {
	parseIfConfigIpv4(output: string): IDataObject[] {
		let results: IDataObject[] = [];

		const lines: string[] = output.split('\n').filter((line) => line.trim() !== ''); // Split lines and filter out empty lines

		for (const line of lines) {
			let newInterface: IDataObject = {};

			const regex =
				/^\t*inet (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+netmask ((?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|(?:0x[a-fA-F0-9]+))\s+broadcast (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
			const match = line.match(regex);
			if (match !== null) {
				//console.log(match);

				newInterface['ipv4'] = match[1];
				newInterface['netmask'] = match[2];
				newInterface['broadcast'] = match[3];

				results.push(newInterface);
			}
		}

		return results;
	}
}
