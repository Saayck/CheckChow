export const readFirstSheetRows = async (file) => {
	const ext = file.name.split(".").pop().toLowerCase();
	if (ext === "xls") {
		const XLSX = await import("xlsx");
		const arrayBuffer = await file.arrayBuffer();
		const workbook = XLSX.read(arrayBuffer, { type: "array" });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];
		const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
		const headers = (rows[0] || []).map((header) => String(header || "").trim());

		return rows.slice(1).map((row) => {
			const item = {};
			headers.forEach((header, index) => {
				if (!header) return;
				item[header] = row[index] ?? "";
			});
			return item;
		});
	}

	const { readSheet } = await import("read-excel-file/browser");
	const sheetRows = await readSheet(file);
	const headers = (sheetRows[0] || []).map((header) => String(header || "").trim());

	return sheetRows.slice(1).map((row) => {
		const item = {};
		headers.forEach((header, index) => {
			if (!header) return;
			item[header] = row[index] ?? "";
		});
		return item;
	});
};

export const writeRowsToXlsx = async (rows, columns, sheetName, fileName) => {
	const { default: writeExcelFile } = await import("write-excel-file/browser");
	const exportColumns = columns.map((column) => ({
		header: { value: column.header, fontWeight: "bold" },
		cell: (row) => ({ value: row[column.key] ?? "" }),
		width: column.width,
	}));

	await writeExcelFile(rows, { columns: exportColumns, sheet: sheetName }).toFile(fileName);
};
