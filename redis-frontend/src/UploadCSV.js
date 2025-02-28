import React, { useState } from "react";
import Papa from "papaparse";
import { toast } from "react-toastify";

const UploadCSV = ({ setTempData }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);

        if (selectedFile) {
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: function (results) {
                    console.log("Parsed CSV Data:", results);
                    if (results.data.length === 0) {
                        toast.error("CSV file is empty!");
                        return;
                    }
                    setTempData({
                        headers: Object.keys(results.data[0]),
                        rows: results.data,
                    });
                },
            });
        }
    };

    return (
        <div>
            <input type="file" accept=".csv" onChange={handleFileChange} />
        </div>
    );
};

export default UploadCSV;
