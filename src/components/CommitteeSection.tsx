/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CommitteeMember } from "../types";
import { Shield, UserPlus, Upload, Trash2, Camera, Crown, Users, Plus } from "lucide-react";

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

  const handlePresetPhoto = (color: string) => {
    // Generate a beautiful initial avatar with gradient
    const initial = name.trim().charAt(0).toUpperCase() || "M";
    const label = isOwner ? "OWNER" : "COMMITTEE";
    const svgString = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='${encodeURIComponent(
      color
    )}'/><stop offset='100%' stop-color='%23111827'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.3'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.4'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>${initial}</text></svg>`;
    setPhotoUrl(svgString);
    setPreviewUrl(svgString);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const resolvedIsOwner = mode ? (mode === "owners") : isOwner;

    // Use default SVG if none uploaded
    const defaultColor = resolvedIsOwner ? "#ca8a04" : "#14532d";
    const defaultLabel = resolvedIsOwner ? "OWNER" : "COMMITTEE";
    const initial = name.trim().charAt(0).toUpperCase() || "M";
    const finalPhoto = photoUrl || `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='${encodeURIComponent(defaultColor)}'/><stop offset='100%' stop-color='%23111827'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.3'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.4'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>${initial}</text></svg>`;

    onAddMember({
      name: name.trim(),
      role: role.trim(),
      photoUrl: finalPhoto,
      isOwner: resolvedIsOwner,
    });

    // Reset Form
    setName("");
    setRole("");
    setIsOwner(mode === "owners");
    setPhotoUrl("");
    setPreviewUrl("");
    setShowForm(false);
  };

  // Split members into Owners and Committee Members
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
              Tournament Team Owners
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
            className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            {showForm ? "Cancel" : mode === "owners" ? "Add Team Owner" : mode === "committee" ? "Add Committee Member" : "Add Board Card"}
          </button>
        )}
      </div>

      {/* Admin Add Member Form */}
      {isAdmin && showForm && (
        <div id="add-member-form-container" className="bg-[#0b2513] border border-yellow-500/20 rounded-2xl p-5 md:p-6 shadow-xl relative animate-fade-in">
          <h3 className="text-sm uppercase tracking-wider text-yellow-400 font-bold mb-4">
            {mode === "owners" ? "Add New Team Owner" : mode === "committee" ? "Add New Committee Member" : "Add New Member Card"}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Col: Photo Upload */}
            <div className="md:col-span-4 flex flex-col items-center justify-center border-r border-emerald-900/30 pr-0 md:pr-6">
              <div className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-emerald-800/80 overflow-hidden bg-[#05140b] flex items-center justify-center mb-3">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-10 h-10 text-emerald-800" />
                )}
              </div>

              {/* Photo Input Selector */}
              <label className="cursor-pointer bg-[#05140b] border border-emerald-800 text-emerald-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:border-emerald-700 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
                <input
                  id="photo-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              <div className="mt-3 text-center">
                <span className="text-[10px] text-emerald-500 font-medium">Or select preset colors:</span>
                <div className="flex gap-2 mt-1.5 justify-center">
                  <button
                    id="preset-color-btn-green"
                    type="button"
                    onClick={() => handlePresetPhoto("#14532d")}
                    className="w-4 h-4 rounded-full bg-emerald-800 hover:scale-110 transition-transform"
                    title="Green"
                  />
                  <button
                    id="preset-color-btn-blue"
                    type="button"
                    onClick={() => handlePresetPhoto("#1e40af")}
                    className="w-4 h-4 rounded-full bg-blue-800 hover:scale-110 transition-transform"
                    title="Blue"
                  />
                  <button
                    id="preset-color-btn-purple"
                    type="button"
                    onClick={() => handlePresetPhoto("#6b21a8")}
                    className="w-4 h-4 rounded-full bg-purple-800 hover:scale-110 transition-transform"
                    title="Purple"
                  />
                  <button
                    id="preset-color-btn-amber"
                    type="button"
                    onClick={() => handlePresetPhoto("#b45309")}
                    className="w-4 h-4 rounded-full bg-amber-800 hover:scale-110 transition-transform"
                    title="Amber"
                  />
                </div>
              </div>
            </div>

            {/* Right Col: Details Input */}
            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="member-name-input">
                    Full Name
                  </label>
                  <input
                    id="member-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Fawad Rana"
                    className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white placeholder-emerald-700/60 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="member-role-input">
                    Role / Title
                  </label>
                  <input
                    id="member-role-input"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Owner, Lahore Qalandars"
                    className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white placeholder-emerald-700/60 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                    required
                  />
                </div>
              </div>

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
                  className="px-4 py-2 border border-emerald-800 text-emerald-400 hover:bg-emerald-950/50 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-add-member-btn"
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md active:scale-95"
                >
                  Save Board Card
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- SECTION 1: OWNERS --- */}
      {(!mode || mode === "owners") && (
        <div id="owners-section-container" className="space-y-6">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-display font-black text-white uppercase tracking-wider">
              Owners
            </h3>
            <span className="h-px flex-1 bg-gradient-to-r from-emerald-800/40 via-emerald-800/10 to-transparent ml-3" />
          </div>

          {owners.length === 0 ? (
            <p className="text-sm text-emerald-600 italic">No owners registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
 * Reusable Card component for Owner or Committee Member
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

  return (
    <div
      id={`member-card-${member.id}`}
      className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col items-center text-center group transition-all duration-300 hover:border-emerald-700/60 hover:shadow-yellow-500/5 hover:-translate-y-1"
    >
      {/* Remove button overlay for Admins */}
      {isAdmin && (
        <button
          id={`remove-member-btn-${member.id}`}
          onClick={() => onRemoveMember(member.id)}
          className="absolute top-3 right-3 text-emerald-600 hover:text-red-400 transition-colors bg-emerald-950/80 p-2 rounded-full border border-emerald-900/50 z-10"
          title="Delete Card"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Profile Avatar / Photo - Large size with responsive design */}
      <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl border-2 border-emerald-800/80 overflow-hidden bg-[#05140b] mb-5 shadow-xl group-hover:border-yellow-500/60 transition-all duration-300 relative">
        <img
          src={member.photoUrl}
          alt={member.name}
          className="w-full h-full object-cover transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Role Details */}
      <h4 className="font-display font-bold text-white text-base tracking-tight mb-1 group-hover:text-yellow-400 transition-colors duration-300">
        {member.name}
      </h4>
      <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider leading-relaxed">
        {member.role}
      </p>

      {/* Squad/Players Section for Owners */}
      {member.isOwner && (
        <div className="w-full mt-6 border-t border-emerald-900/40 pt-4 text-left z-10">
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
                      className="text-emerald-600 hover:text-red-400 p-0.5 transition-colors shrink-0"
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
                className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 font-bold px-2.5 py-1 rounded-lg text-xs transition-colors shrink-0"
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
