export const printHtmlDocument = (html) => {
	const frame = document.createElement("iframe");
	frame.title = "Vista de impresion";
	frame.style.position = "fixed";
	frame.style.right = "0";
	frame.style.bottom = "0";
	frame.style.width = "0";
	frame.style.height = "0";
	frame.style.border = "0";

	let cleaned = false;
	const cleanup = () => {
		if (cleaned) return;
		cleaned = true;
		frame.remove();
		window.focus();
	};

	document.body.appendChild(frame);
	const doc = frame.contentDocument || frame.contentWindow?.document;
	if (!doc) {
		cleanup();
		return;
	}
	doc.open();
	doc.write(html);
	doc.close();

	window.setTimeout(() => {
		const printWindow = frame.contentWindow;
		if (!printWindow) {
			cleanup();
			return;
		}
		printWindow.onafterprint = cleanup;
		printWindow.focus();
		window.setTimeout(() => {
			printWindow.print();
			window.setTimeout(cleanup, 1000);
		}, 100);
	}, 100);
};
