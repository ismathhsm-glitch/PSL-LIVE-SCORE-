/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CommitteeMember } from "../types";
import { Shield, UserPlus, Upload, Trash2, Camera, Crown, Users, Edit2, Check, X } from "lucide-react";
import { PSL_TEAMS } from "../initialData";

interface CommitteeSectionProps {
  members: CommitteeMember[];
  isAdmin: boolean;
  onAddMember: (member: Omit<CommitteeMember, "id">) => void;
  onRemoveMember: (id: string) => void;
  onUpdateMember?: (member: CommitteeMember) => void;
  mode?: "owners" | "committee";
}

export default function CommitteeSection({
  members,
  isAdmin,
  onAddMember,
  onRemoveMember,
  onUpdateMember,
  mode,
}: CommitteeSectionProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [isOwner, setIsOwner] = useState(mode === "owners");
  const [photoUrl, setPhotoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  
  const [captainName, setCaptainName] = useState("");
  const [captainPhotoUrl, setCaptainPhotoUrl] = useState("");
  const [captainPreviewUrl, setCaptainPreviewUrl] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  
  const [showForm, setShowForm] = useState(false);

  // Read selected image file as Base64 data URL
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoUrl(base64String);
      setPreviewUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleCaptainPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCaptainPhotoUrl(base64String);
      setCaptainPreviewUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetPhoto = (color: string) => {
    const initial = name.trim().charAt(0).toUpperCase() || "M";
    const svgString = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='${encodeURIComponent(
      color
    )}'/><stop offset='100%' stop-color='%23111827'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.35'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.45'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>${initial}</text></svg>`;
    setPhotoUrl(svgString);
    setPreviewUrl(svgString);
  };

  const handlePresetCaptainPhoto = (color: string) => {
    const initial = captainName.trim().charAt(0).toUpperCase() || "C";
    const svgString = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='cg' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='${encodeURIComponent(
      color
    )}'/><stop offset='100%' stop-color='%23111827'/></linearGradient></defs><rect width='100' height='100' fill='url(%23cg)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.35'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.45'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>${initial}</text></svg>`;
    setCaptainPhotoUrl(svgString);
    setCaptainPreviewUrl(svgString);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // In owners (Teams) mode, role is Owner, [SelectedTeam]
    let finalRole = role.trim();
    if (mode === "owners") {
      if (!selectedTeam) {
        alert("Please select a team");
        return;
      }
      finalRole = `Owner, ${selectedTeam}`;
    } else if (!finalRole) {
      return;
    }

    const resolvedIsOwner = mode ? (mode === "owners") : isOwner;

    // Use default SVG if none uploaded
    const defaultColor = resolvedIsOwner ? "#ca8a04" : "#14532d";
    const initial = name.trim().charAt(0).toUpperCase() || "M";
    const finalPhoto = photoUrl || `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='${encodeURIComponent(defaultColor)}'/><stop offset='100%' stop-color='%23111827'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.3'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.4'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>${initial}</text></svg>`;

    const initialCaptain = captainName.trim().charAt(0).toUpperCase() || "C";
    const defaultCaptainColor = "#1e40af";
    const finalCaptainPhoto = captainPhotoUrl || `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='cg' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='${encodeURIComponent(defaultCaptainColor)}'/><stop offset='100%' stop-color='%23111827'/></linearGradient></defs><rect width='100' height='100' fill='url(%23cg)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.3'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.4'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>${initialCaptain}</text></svg>`;

    onAddMember({
      name: name.trim(),
      role: finalRole,
      photoUrl: finalPhoto,
      isOwner: resolvedIsOwner,
      ...(resolvedIsOwner ? {
        captainName: captainName.trim() || "Not Assigned",
        captainPhotoUrl: finalCaptainPhoto,
      } : {})
    });

    // Reset Form
    setName("");
    setRole("");
    setIsOwner(mode === "owners");
    setPhotoUrl("");
    setPreviewUrl("");
    setCaptainName("");
    setCaptainPhotoUrl("");
    setCaptainPreviewUrl("");
    setSelectedTeam("");
    setShowForm(false);
  };

  const owners = members.filter((m) => m.isOwner === true);
  const committeeMembers = members.filter((m) => m.isOwner !== true);

  return (
    <div id="committee-section" className="space-y-12">
      {/* Header with Admin Toggle */}
      <div className="flex items-center justify-between border-b border-emerald-900/30 pb-4">
        <h2 className="text-2xl font-display font-black text-white flex items-center gap-2.5">
          {mode === "owners" ? (
            <>
              <Crown className="w-6 h-6 text-yellow-500" />
              Tournament Teams
            </>
          ) : mode === "committee" ? (
            <>
              <Users className="w-6 h-6 text-yellow-500" />
              Tournament Committee
            </>
          ) : (
            <>
              <Shield className="w-6 h-6 text-yellow-500" />
              Management Board &amp; Officials
            </>
          )}
        </h2>

        {isAdmin && (
          <button
            id="toggle-add-member-form-btn"
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {showForm ? "Cancel" : mode === "owners" ? "Add Team Card" : mode === "committee" ? "Add Committee Member" : "Add Board Card"}
          </button>
        )}
      </div>

      {/* Admin Add Member Form */}
      {isAdmin && showForm && (
        <div id="add-member-form-container" className="bg-[#0b2513] border border-yellow-500/20 rounded-2xl p-5 md:p-6 shadow-xl relative animate-fade-in">
          <h3 className="text-sm uppercase tracking-wider text-yellow-400 font-bold mb-4">
            {mode === "owners" ? "Add New Team Card" : mode === "committee" ? "Add New Committee Member" : "Add New Member Card"}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Col: Photo Upload */}
            <div className="md:col-span-5 flex flex-col items-center justify-center border-r border-emerald-900/30 pr-0 md:pr-6">
              <div className="flex flex-wrap gap-4 justify-center mb-3">
                {/* Owner Photo Box */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Owner Photo</span>
                  <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-emerald-800/80 overflow-hidden bg-[#05140b] flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Owner Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-emerald-800" />
                    )}
                  </div>
                  <label className="mt-2 cursor-pointer bg-[#05140b] border border-emerald-800 text-emerald-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 hover:border-emerald-700 transition-colors">
                    <Upload className="w-3 h-3" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  <div className="flex gap-1.5 mt-2 justify-center">
                    <button type="button" onClick={() => handlePresetPhoto("#ca8a04")} className="w-3.5 h-3.5 rounded-full bg-yellow-600 cursor-pointer" title="Gold Preset" />
                    <button type="button" onClick={() => handlePresetPhoto("#14532d")} className="w-3.5 h-3.5 rounded-full bg-emerald-800 cursor-pointer" title="Green Preset" />
                  </div>
                </div>

                {/* Captain Photo Box (Only for Teams Mode) */}
                {mode === "owners" && (
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider mb-1">Captain Photo</span>
                    <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-emerald-800/80 overflow-hidden bg-[#05140b] flex items-center justify-center">
                      {captainPreviewUrl ? (
                        <img src={captainPreviewUrl} alt="Captain Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-emerald-800" />
                      )}
                    </div>
                    <label className="mt-2 cursor-pointer bg-[#05140b] border border-emerald-800 text-emerald-300 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 hover:border-emerald-700 transition-colors">
                      <Upload className="w-3 h-3" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCaptainPhotoChange}
                        className="hidden"
                      />
                    </label>
                    <div className="flex gap-1.5 mt-2 justify-center">
                      <button type="button" onClick={() => handlePresetCaptainPhoto("#1e40af")} className="w-3.5 h-3.5 rounded-full bg-blue-600 cursor-pointer" title="Blue Preset" />
                      <button type="button" onClick={() => handlePresetCaptainPhoto("#6b21a8")} className="w-3.5 h-3.5 rounded-full bg-purple-800 cursor-pointer" title="Purple Preset" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Details Input */}
            <div className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="member-name-input">
                    {mode === "owners" ? "Owner Name" : "Full Name"}
                  </label>
                  <input
                    id="member-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={mode === "owners" ? "e.g. Fawad Rana" : "e.g. Ismath"}
                    className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white placeholder-emerald-700/60 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                    required
                  />
                </div>

                {mode === "owners" ? (
                  <div>
                    <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="member-team-select">
                      Select Team
                    </label>
                    <select
                      id="member-team-select"
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                      required
                    >
                      <option value="">-- Choose Team --</option>
                      {PSL_TEAMS.map((teamName) => (
                        <option key={teamName} value={teamName}>
                          {teamName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="member-role-input">
                      Role / Title
                    </label>
                    <input
                      id="member-role-input"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Technical Advisor"
                      className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white placeholder-emerald-700/60 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                      required
                    />
                  </div>
                )}
              </div>

              {mode === "owners" && (
                <div>
                  <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="captain-name-input">
                    Captain Name
                  </label>
                  <input
                    id="captain-name-input"
                    type="text"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="e.g. Shaheen Afridi"
                    className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white placeholder-emerald-700/60 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                    required
                  />
                </div>
              )}

              {!mode && (
                <div>
                  <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Member Category
                  </label>
                  <div className="flex items-center gap-6 bg-[#05140b] border border-emerald-800 rounded-xl p-3">
                    <label className="inline-flex items-center text-xs font-bold text-emerald-300 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="isOwnerOption"
                        checked={!isOwner}
                        onChange={() => setIsOwner(false)}
                        className="form-radio h-4 w-4 text-yellow-500 border-emerald-800 focus:ring-yellow-500 bg-black mr-2 cursor-pointer"
                      />
                      Committee Member
                    </label>
                    <label className="inline-flex items-center text-xs font-bold text-emerald-300 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="isOwnerOption"
                        checked={isOwner}
                        onChange={() => setIsOwner(true)}
                        className="form-radio h-4 w-4 text-yellow-500 border-emerald-800 focus:ring-yellow-500 bg-black mr-2 cursor-pointer"
                      />
                      Owner
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  id="cancel-add-member-btn"
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-emerald-800 text-emerald-400 hover:bg-emerald-950/50 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-add-member-btn"
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Save Team Card
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- SECTION 1: TEAMS --- */}
      {(!mode || mode === "owners") && (
        <div id="owners-section-container" className="space-y-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-display font-black text-white uppercase tracking-wider">
              Tournament Teams
            </h3>
            <span className="h-px flex-1 bg-gradient-to-r from-emerald-800/40 via-emerald-800/10 to-transparent ml-3" />
          </div>

          {owners.length === 0 ? (
            <p className="text-sm text-emerald-600 italic">No teams registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {owners.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isAdmin={isAdmin}
                  onRemoveMember={onRemoveMember}
                  onUpdateMember={onUpdateMember}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- SECTION 2: COMMITTEE MEMBERS --- */}
      {(!mode || mode === "committee") && (
        <div id="committee-section-container" className="space-y-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-display font-black text-white uppercase tracking-wider">
              Committee Members
            </h3>
            <span className="h-px flex-1 bg-gradient-to-r from-emerald-800/40 via-emerald-800/10 to-transparent ml-3" />
          </div>

          {committeeMembers.length === 0 ? (
            <p className="text-sm text-emerald-600 italic">No committee members registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {committeeMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isAdmin={isAdmin}
                  onRemoveMember={onRemoveMember}
                  onUpdateMember={onUpdateMember}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Reusable Card component for Team or Committee Member
 */
function MemberCard({
  member,
  isAdmin,
  onRemoveMember,
  onUpdateMember,
}: {
  key?: string;
  member: CommitteeMember;
  isAdmin: boolean;
  onRemoveMember: (id: string) => void;
  onUpdateMember?: (updated: CommitteeMember) => void;
}) {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isEditingCaptain, setIsEditingCaptain] = useState(false);
  const [capName, setCapName] = useState(member.captainName || "");
  const [capPhoto, setCapPhoto] = useState(member.captainPhotoUrl || "");
  const [capPreview, setCapPreview] = useState(member.captainPhotoUrl || "");

  useEffect(() => {
    setCapName(member.captainName || "");
    setCapPhoto(member.captainPhotoUrl || "");
    setCapPreview(member.captainPhotoUrl || "");
  }, [member]);

  const players = member.players || [];

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    if (onUpdateMember) {
      onUpdateMember({
        ...member,
        players: [...players, newPlayerName.trim()],
      });
    }
    setNewPlayerName("");
  };

  const handleRemovePlayer = (playerToRemove: string) => {
    if (onUpdateMember) {
      onUpdateMember({
        ...member,
        players: players.filter((p) => p !== playerToRemove),
      });
    }
  };

  const handleCaptainPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCapPhoto(base64String);
      setCapPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCaptainDetails = () => {
    if (!capName.trim()) {
      alert("Please enter a captain name");
      return;
    }
    if (onUpdateMember) {
      onUpdateMember({
        ...member,
        captainName: capName.trim(),
        captainPhotoUrl: capPhoto,
      });
    }
    setIsEditingCaptain(false);
  };

  const teamName = member.isOwner ? member.role.replace(/^Owner,\s*/i, "") : "";
  const defaultCaptainPhoto = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='cg' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%231e40af'/><stop offset='100%' stop-color='%23111827'/></linearGradient></defs><rect width='100' height='100' fill='url(%23cg)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.3'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.4'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>CAPTAIN</text></svg>`;

  return (
    <div
      id={`member-card-${member.id}`}
      className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col items-center text-center group transition-all duration-300 hover:border-emerald-700/60 hover:shadow-yellow-500/5 hover:-translate-y-1 w-full"
    >
      {/* Remove button overlay for Admins */}
      {isAdmin && (
        <button
          id={`remove-member-btn-${member.id}`}
          onClick={() => onRemoveMember(member.id)}
          className="absolute top-3 right-3 text-emerald-600 hover:text-red-400 transition-colors bg-emerald-950/80 p-2 rounded-full border border-emerald-900/50 z-10 cursor-pointer"
          title="Delete Card"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {member.isOwner ? (
        // === RENDER FOR TEAM CARD ===
        <div className="w-full flex flex-col items-center">
          <h3 className="font-display font-black text-yellow-500 text-lg uppercase tracking-wider mb-5">
            {teamName}
          </h3>

          <div className="flex gap-6 items-start justify-center mb-5 w-full">
            {/* Owner Section */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-emerald-800/80 overflow-hidden bg-[#05140b] shadow-md group-hover:border-yellow-500/40 transition-all duration-300 relative">
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-full h-full object-cover transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-2">Owner</span>
              <span className="text-xs text-white font-semibold mt-0.5 text-center leading-tight truncate max-w-[100px] block font-sans" title={member.name}>
                {member.name}
              </span>
            </div>

            {/* Captain Section */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-emerald-800/80 overflow-hidden bg-[#05140b] shadow-md group-hover:border-yellow-500/40 transition-all duration-300 relative">
                <img
                  src={member.captainPhotoUrl || defaultCaptainPhoto}
                  alt={member.captainName || "Captain"}
                  className="w-full h-full object-cover transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-wider mt-2">Captain</span>
              <span className="text-xs text-white font-semibold mt-0.5 text-center leading-tight truncate max-w-[100px] block font-sans" title={member.captainName || "Not Set"}>
                {member.captainName || "Not Set"}
              </span>
            </div>
          </div>

          {/* Admin Captain Edit Interface */}
          {isAdmin && (
            <div className="w-full mb-3 text-right">
              {isEditingCaptain ? (
                <div className="bg-[#05140b]/80 p-3 rounded-xl border border-emerald-800 text-left space-y-3 mb-3 animate-fade-in w-full">
                  <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider block">Edit Captain Details</span>
                  <div>
                    <input
                      type="text"
                      placeholder="Captain Name"
                      value={capName}
                      onChange={(e) => setCapName(e.target.value)}
                      className="w-full bg-[#05140b] border border-emerald-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="cursor-pointer bg-[#05140b] border border-emerald-800 text-emerald-300 hover:text-white px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 hover:border-emerald-700 transition-colors">
                      <Upload className="w-3 h-3" />
                      Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCaptainPhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsEditingCaptain(false)}
                        className="bg-emerald-900/40 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCaptainDetails}
                        className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 p-1 rounded-lg transition-colors font-bold cursor-pointer"
                        title="Save Captain"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingCaptain(true)}
                  className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-yellow-400 font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Edit Captain
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        // === RENDER FOR COMMITTEE CARD ===
        <>
          {/* Profile Avatar / Photo */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl border-2 border-emerald-800/80 overflow-hidden bg-[#05140b] mb-5 shadow-xl group-hover:border-yellow-500/60 transition-all duration-300 relative">
            <img
              src={member.photoUrl}
              alt={member.name}
              className="w-full h-full object-cover transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          <h4 className="font-display font-bold text-white text-base tracking-tight mb-1 group-hover:text-yellow-400 transition-colors duration-300">
            {member.name}
          </h4>
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider leading-relaxed mb-4">
            {member.role}
          </p>
        </>
      )}

      {/* Squad/Players Section for Owners/Teams */}
      {member.isOwner && (
        <div className="w-full mt-3 border-t border-emerald-900/40 pt-4 text-left z-10">
          <h5 className="text-[11px] uppercase tracking-wider text-yellow-500 font-bold mb-2 flex items-center justify-between">
            <span>Team Players / Squad</span>
            <span className="text-[10px] text-emerald-500 font-normal">({players.length})</span>
          </h5>

          {players.length === 0 ? (
            <p className="text-[11px] text-emerald-600/70 italic">No players added yet.</p>
          ) : (
            <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
              {players.map((player, idx) => (
                <li
                  key={idx}
                  className="text-xs text-emerald-100 flex items-center justify-between bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-900/30"
                >
                  <span className="truncate mr-2 font-medium">{player}</span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(player)}
                      className="text-emerald-600 hover:text-red-400 p-0.5 transition-colors shrink-0 cursor-pointer"
                      title="Remove Player"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isAdmin && (
            <form onSubmit={handleAddPlayerSubmit} className="mt-3 flex gap-1.5">
              <input
                type="text"
                placeholder="Add player..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="flex-1 min-w-0 bg-[#05140b] border border-emerald-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-emerald-700/60 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 font-bold px-2.5 py-1 rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
              >
                Add
              </button>
            </form>
          )}
        </div>
      )}

      {/* Decorative indicator line at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent group-hover:via-yellow-500/30 transition-all duration-300"></div>
    </div>
  );
}
