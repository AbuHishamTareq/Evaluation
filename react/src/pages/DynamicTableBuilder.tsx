import { useEffect, useState } from "react";
import api from "../axios";
import Header from "../components/dashboard/Header";
import { PlusCircle, SaveAll, Trash2 } from "lucide-react";

interface Option {
    en_text: string;
    ar_text: string;
    value: string;
}

interface TableRow {
    headerNameEn: string;
    headerNameAr: string;
    fieldType: string;
    options: Option[];
    order: number;
}

interface Section {
    id: number;
    en_label: string;
    name: string;
}

export default function DynamicTableBuilder() {
    const [sections, setSections] = useState<Section[]>([]);
    const [selectedSection, setSelectedSection] = useState("");
    const [rows, setRows] = useState<TableRow[]>([
        { headerNameEn: "", headerNameAr: "", fieldType: "", options: [], order: 0 },
    ]);

    const getSection = async () => {
        try {
            const res = await api.get("api/sections/tabular");
            setSections(res.data.sections);
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.log(e.message);
            } else {
                console.log("An unknown error occurred.");
            }
        }
    };

    useEffect(() => {
        getSection();
    }, []);

    const handleChange = (index: number, field: keyof TableRow, value: string) => {
        const updated = [...rows];

        if (field === "order") {
            updated[index][field] = Number(value) as any;
        } else {
            updated[index][field] = value as any;
        }

        // Clear options if needed
        if (field === "fieldType" && !["select", "radio", "rating"].includes(value)) {
            updated[index].options = [];
        }

        setRows(updated);
    };

    const addRow = () => {
        setRows([...rows, { headerNameEn: "", headerNameAr: "", fieldType: "", options: [], order: 0 }]);
    };

    const deleteRow = (index: number) => {
        const updated = rows.filter((_, i) => i !== index);
        setRows(updated);
    };

    const handleOptionChange = (rowIndex: number, optIndex: number, field: keyof Option, value: string) => {
        const updated = [...rows];
        updated[rowIndex].options[optIndex][field] = value;
        setRows(updated);
    };

    const addOption = (rowIndex: number) => {
        const updated = [...rows];
        updated[rowIndex].options.push({ en_text: "", ar_text: "", value: "" });
        setRows(updated);
    };

    const deleteOption = (rowIndex: number, optIndex: number) => {
        const updated = [...rows];
        updated[rowIndex].options.splice(optIndex, 1);
        setRows(updated);
    };

    const saveAll = async () => {
        if (!selectedSection) {
            alert("Please select a section first!");
            return;
        }

        try {
            const payload = rows.map((row) => ({
                ...row,
                options: row.options && row.options.length ? row.options : null,
            }));

            const { data } = await api.post("/api/dynamic-tables", {
                section: selectedSection,
                rows: payload,
            });

            alert(data.message);

            // Reset form
            setRows([{ headerNameEn: "", headerNameAr: "", fieldType: "", options: [], order: 0 }]);
            setSelectedSection("");
        } catch (error: any) {
            const message = error.response?.data?.error || error.message || "Something went wrong!";
            alert(message);
        }
    };

    return (
        <Header title="Dynamic Table Builder">
            <div className="p-4 space-y-10">

                <div className="flex items-end pt-4">
                    <div>
                        <label className="block mb-1 font-semibold">Select Section:</label>
                        <select
                            className="border px-2 py-1 w-96"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                        >
                            <option value="">Select Section</option>
                            {sections.map((section) => (
                                <option key={section.id} value={section.name}>
                                    {section.en_label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Save All pushed to the right */}
                    <button
                        onClick={saveAll}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded ml-auto"
                    >
                        <SaveAll className="w-5 h-5" /> Save All
                    </button>
                </div>

                <table className="w-full border-collapse border">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <th className="border p-2">Header Name (EN)</th>
                            <th className="border p-2">Header Name (AR)</th>
                            <th className="border p-2">Field Type</th>
                            <th className="border p-2">Options</th>
                            <th className="border p-2">Column Order</th>
                            <th className="border p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => {
                            const isOptionsEnabled = ["select", "radio", "rating"].includes(row.fieldType);

                            return (
                                <tr key={index}>
                                    <td className="border p-2">
                                        <input
                                            type="text"
                                            value={row.headerNameEn}
                                            onChange={(e) => handleChange(index, "headerNameEn", e.target.value)}
                                            className="border p-1 w-full"
                                        />
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="text"
                                            value={row.headerNameAr}
                                            onChange={(e) => handleChange(index, "headerNameAr", e.target.value)}
                                            className="border p-1 w-full"
                                        />
                                    </td>
                                    <td className="border p-2">
                                        <select
                                            value={row.fieldType}
                                            onChange={(e) => handleChange(index, "fieldType", e.target.value)}
                                            className="border p-1 w-full"
                                        >
                                            <option value="">Select Type</option>
                                            <option value="label">Label</option>
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="select">Select</option>
                                            <option value="radio">Radio</option>
                                            <option value="rating">Rating</option>
                                        </select>
                                    </td>
                                    <td className="border p-2">
                                        {isOptionsEnabled ? (
                                            <div className="space-y-1">
                                                {row.options.map((opt, optIndex) => (
                                                    <div key={optIndex} className="flex gap-1 mb-1">
                                                        <input
                                                            type="text"
                                                            placeholder="EN"
                                                            value={opt.en_text}
                                                            onChange={(e) => handleOptionChange(index, optIndex, "en_text", e.target.value)}
                                                            className="border p-1 w-24"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="AR"
                                                            value={opt.ar_text}
                                                            onChange={(e) => handleOptionChange(index, optIndex, "ar_text", e.target.value)}
                                                            className="border p-1 w-24"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Value"
                                                            value={opt.value}
                                                            onChange={(e) => handleOptionChange(index, optIndex, "value", e.target.value)}
                                                            className="border p-1 w-16"
                                                        />
                                                        <button
                                                            onClick={() => deleteOption(index, optIndex)}
                                                            className="bg-red-500 text-white px-1 rounded"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => addOption(index)}
                                                    className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs"
                                                >
                                                    <PlusCircle className="w-4 h-4" />
                                                    Add Option
                                                </button>
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value=""
                                                className="border p-1 w-full bg-gray-100 cursor-not-allowed"
                                                disabled
                                            />
                                        )}
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            value={row.order}
                                            onChange={(e) => handleChange(index, "order", e.target.value)}
                                            className="border p-1 w-full"
                                            min={0}
                                        />
                                    </td>
                                    <td className="border p-2 text-center">
                                        <button
                                            onClick={() => deleteRow(index)}
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="flex space-x-2">
                    <button
                        onClick={addRow}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Add Row
                    </button>
                </div>
            </div>
        </Header>
    );
}