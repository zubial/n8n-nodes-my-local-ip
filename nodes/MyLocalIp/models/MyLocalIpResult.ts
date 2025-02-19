export class MyLocalIpResult {
	interfaces: Interface[] = [];
}

export class Interface {
	hostname: string | null = null;
	family: string | null = null;
	interface: string | null = null;
	address: string | null = null;
	mac: string | null = null;
	subnet: any | null = null;
	internal: boolean | null = null;
}
