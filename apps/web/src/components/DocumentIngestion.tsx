"use client";

import React, { useState, useEffect } from "react";
import { UploadCloud, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
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
      await climateApi.uploadFile(selectedFile, targetRegion);
      setStatusMessage({
        type: "success",
        text: `Successfully uploaded and registered "${selectedFile.name}". Ingested into climate decision pipeline.`,
      });
      setSelectedFile(null);
      const fileInput = document.getElementById("file-upload-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
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
      <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-notion-hover text-notion-text border border-notion-border">
        {ext}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-notion-text flex items-center space-x-2.5">
              <UploadCloud className="w-5 h-5 text-emerald-500" />
              <span>Municipal Document & Data Ingestion</span>
            </h1>
            <p className="text-xs sm:text-sm text-notion-secondary mt-1 max-w-3xl leading-relaxed">
              Upload regional GIS shapefiles (GeoJSON/KML), monsoon drainage master plans (PDF), hydrological telemetry (CSV), or municipal budgets (XLSX). Files are routed through the Express gateway and indexed for AI scenario simulation.
            </p>
          </div>
          <div className="text-xs sm:text-sm text-notion-text bg-notion-bg px-4 py-2.5 rounded-lg border border-notion-border whitespace-nowrap shadow-inner">
            <span className="text-emerald-500 font-bold font-mono text-sm sm:text-base mr-1.5">{files.length}</span>
            <span>Documents Indexed</span>
          </div>
        </div>
      </div>

      {/* Real Upload Form */}
      <div className="bg-notion-sidebar border border-notion-border rounded-xl p-5 sm:p-6 space-y-5 shadow-sm">
        <h2 className="text-base font-bold text-notion-text">Upload Environmental Document or Spatial File</h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* File Input */}
            <div>
              <label className="block text-sm font-semibold text-notion-text mb-1.5">
                Select File (PDF, GeoJSON, CSV, XLSX, KML - Max 25MB)
              </label>
              <input
                id="file-upload-input"
                type="file"
                accept=".pdf,.geojson,.json,.csv,.xlsx,.xls,.kml"
                onChange={handleFileChange}
                disabled={isUploading}
                className="w-full text-sm text-notion-text file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-bold file:bg-notion-hover file:text-emerald-500 hover:file:bg-notion-border bg-notion-bg border border-notion-border rounded-lg p-2 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Target Region Tag */}
            <div>
              <label className="block text-sm font-semibold text-notion-text mb-1.5">
                Associate with Municipality / Region
              </label>
              <select
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                disabled={isUploading}
                className="w-full bg-notion-bg border border-notion-border rounded-lg px-3.5 py-2.5 text-sm text-notion-text focus:outline-none focus:border-emerald-500 cursor-pointer"
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
            <div className="text-xs sm:text-sm text-notion-secondary">
              {selectedFile ? (
                <span>
                  Selected file: <strong className="text-notion-text">{selectedFile.name}</strong> ({formatFileSize(selectedFile.size)})
                </span>
              ) : (
                <span>No file selected yet.</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-sm flex items-center space-x-2 transition-colors cursor-pointer shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? "Uploading via Gateway..." : "Upload & Index Document"}</span>
            </button>
          </div>
        </form>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-lg text-sm flex items-center space-x-2.5 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                : "bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/30"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Uploaded Documents Table */}
      <div className="bg-notion-sidebar border border-notion-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 bg-notion-bg border-b border-notion-border flex items-center justify-between">
          <h2 className="text-base font-bold text-notion-text">
            Registered Environmental Documents & GIS Datasets
          </h2>
          <button
            onClick={loadFiles}
            className="text-xs sm:text-sm text-notion-secondary hover:text-emerald-500 underline cursor-pointer"
          >
            Refresh List
          </button>
        </div>

        {isLoadingList ? (
          <div className="p-10 text-center text-sm text-notion-secondary">Loading document repository...</div>
        ) : files.length === 0 ? (
          <div className="p-10 text-center text-sm text-notion-secondary">
            No documents uploaded yet. Upload a municipal report or GeoJSON file above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-notion-bg text-notion-secondary uppercase text-xs tracking-wider border-b border-notion-border font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Document Name</th>
                  <th className="px-5 py-3.5">Format</th>
                  <th className="px-5 py-3.5">Size</th>
                  <th className="px-5 py-3.5">Municipality</th>
                  <th className="px-5 py-3.5">Parsed Content Summary</th>
                  <th className="px-5 py-3.5">Uploaded</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-notion-border text-notion-text">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-notion-hover/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-notion-text whitespace-nowrap">
                      {file.original_name}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getFormatBadge(file.mime_type, file.original_name)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs sm:text-sm text-notion-secondary whitespace-nowrap">
                      {formatFileSize(Number(file.size_bytes))}
                    </td>
                    <td className="px-5 py-3.5 text-notion-text whitespace-nowrap">
                      {file.region || "All Municipalities"}
                    </td>
                    <td className="px-5 py-3.5 text-notion-secondary max-w-sm leading-relaxed text-xs sm:text-sm">
                      {file.summary}
                    </td>
                    <td className="px-5 py-3.5 text-notion-secondary whitespace-nowrap font-mono text-xs">
                      {new Date(file.uploaded_at).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(file.id, file.original_name)}
                        title="Remove file record"
                        className="p-1.5 rounded-lg text-notion-secondary hover:text-red-500 hover:bg-notion-hover transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
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
      <div className="bg-notion-bg border border-notion-border rounded-xl p-5 text-sm text-notion-secondary space-y-2">
        <h3 className="font-bold text-notion-text text-sm">How Ingested Files Guide Decision Intelligence:</h3>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-notion-text">
          <li><strong>GeoJSON / KML layers:</strong> Ingested into PostGIS to delineate administrative wards, natural retention swales, and flood-prone drainage junctions.</li>
          <li><strong>CSV Sensor Feeds:</strong> Provide continuous rainfall, stream stage, and AQI telemetry to calibrate scenario baseline models.</li>
          <li><strong>PDF Policy & DPR Documents:</strong> Parsed by the query reasoning engine to extract departmental cost limits and council guidelines.</li>
        </ul>
      </div>
    </div>
  );
}
