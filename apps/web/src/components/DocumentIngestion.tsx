"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, Trash2, CheckCircle2, AlertCircle, FileSpreadsheet, MapPin } from "lucide-react";
import { climateApi } from "../lib/api";
import type { UploadedFile, RegionInfo } from "../lib/types";

interface DocumentIngestionProps {
  selectedRegion: string;
  regions: RegionInfo[];
}

export function DocumentIngestion({ selectedRegion, regions }: DocumentIngestionProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRegion, setTargetRegion] = useState<string>(selectedRegion);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);

  // Keep target region in sync with global selection initially
  useEffect(() => {
    setTargetRegion(selectedRegion);
  }, [selectedRegion]);

  const loadFiles = async () => {
    setIsLoadingList(true);
    try {
      const data = await climateApi.getFiles();
      setFiles(data);
    } catch (err: any) {
      console.warn("Using offline file cache:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStatusMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatusMessage({ type: "error", text: "Please select an environmental data file to upload." });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const newRecord = await climateApi.uploadFile(selectedFile, targetRegion);
      setStatusMessage({
        type: "success",
        text: `Successfully uploaded and registered "${selectedFile.name}". Ingested into climate decision pipeline.`,
      });
      setSelectedFile(null);
      // Reset input
      const fileInput = document.getElementById("file-upload-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      // Refresh files list
      await loadFiles();
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: `Upload failed via Express Gateway: ${err.message}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the repository?`)) return;

    try {
      await climateApi.deleteFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setStatusMessage({ type: "success", text: `File "${name}" removed.` });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: `Failed to delete file: ${err.message}` });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 KB";
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getFormatBadge = (mime: string, name: string) => {
    const ext = name.split(".").pop()?.toUpperCase() || "FILE";
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
        {ext}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold text-slate-100">Municipal Document & Data Ingestion</h1>
            <p className="text-xs text-slate-400 mt-1">
              Upload regional GIS shapefiles (GeoJSON/KML), monsoon drainage master plans (PDF), hydrological telemetry (CSV), or municipal budgets (XLSX). All files are routed through the Express gateway and indexed for AI scenario simulation.
            </p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded border border-slate-800 whitespace-nowrap">
            <span className="text-emerald-400 font-semibold">{files.length}</span> Documents Registered
          </div>
        </div>
      </div>

      {/* Real Upload Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Upload Municipal Environmental Asset</h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select File (PDF, GeoJSON, CSV, XLSX, KML - Max 25MB)
              </label>
              <input
                id="file-upload-input"
                type="file"
                accept=".pdf,.geojson,.json,.csv,.xlsx,.xls,.kml"
                onChange={handleFileChange}
                disabled={isUploading}
                className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 bg-slate-950 border border-slate-700 rounded p-1.5 focus:outline-none"
              />
            </div>

            {/* Target Region Tag */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Associate with Municipality / Region
              </label>
              <select
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                disabled={isUploading}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-500">
              {selectedFile ? (
                <span>
                  Selected: <strong>{selectedFile.name}</strong> ({formatFileSize(selectedFile.size)})
                </span>
              ) : (
                <span>No file selected yet.</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-semibold rounded text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? "Uploading via Express..." : "Upload & Ingest Document"}</span>
            </button>
          </div>
        </form>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded text-xs flex items-center space-x-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/60"
                : "bg-red-950/40 text-red-300 border border-red-800/60"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Uploaded Documents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">Registered Environmental Documents & GIS Datasets</h2>
          <button
            onClick={loadFiles}
            className="text-xs text-slate-400 hover:text-emerald-400 underline"
          >
            Refresh List
          </button>
        </div>

        {isLoadingList ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading document repository...</div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No documents uploaded yet. Upload a municipal report or GeoJSON file above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Document Name</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Associated Region</th>
                  <th className="px-4 py-3">Parsed Content & Decision Context</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-100 whitespace-nowrap">
                      {file.original_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getFormatBadge(file.mime_type, file.original_name)}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {formatFileSize(Number(file.size_bytes))}
                    </td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                      {file.region || "All Municipalities"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs leading-normal">
                      {file.summary}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(file.uploaded_at).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(file.id, file.original_name)}
                        title="Remove file record"
                        className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Integration Context Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-400 space-y-2">
        <h3 className="font-semibold text-slate-300">How Ingested Files Guide Decision Intelligence:</h3>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
          <li><strong>GeoJSON / KML layers:</strong> Ingested into PostGIS to delineate administrative wards, natural retention swales, and flood-prone drainage junctions.</li>
          <li><strong>CSV Sensor Feeds:</strong> Provide continuous rainfall, stream stage, and AQI telemetry to calibrate scenario baseline models.</li>
          <li><strong>PDF Policy & DPR Documents:</strong> Parsed by the query reasoning engine to extract departmental cost limits and council guidelines.</li>
        </ul>
      </div>
    </div>
  );
}
