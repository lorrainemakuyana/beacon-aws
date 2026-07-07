import { User } from "@/interfaces";

const now = Date.now();

export const dummyUsers: User[] = [
  { uid: "user_020", displayName: "Sarah Chen", email: "sarah.c@vol.org", role: "volunteer", skills: ["leadership"], createdAt: now, lastActive: now },
  { uid: "user_021", displayName: "Michael Torres", email: "michael.t@vol.org", role: "volunteer", skills: [], createdAt: now, lastActive: now },
  { uid: "user_022", displayName: "Emily Park", email: "emily.p@vol.org", role: "volunteer", skills: [], createdAt: now, lastActive: now },
  { uid: "user_023", displayName: "James Williams", email: "james.w@vol.org", role: "volunteer", skills: [], createdAt: now, lastActive: now },
  { uid: "user_024", displayName: "Rachel Kim", email: "rachel.k@vol.org", role: "volunteer", skills: [], createdAt: now, lastActive: now },
  { uid: "user_025", displayName: "David Nguyen", email: "david.n@vol.org", role: "volunteer", skills: [], createdAt: now, lastActive: now },
  { uid: "user_026", displayName: "Priya Patel", email: "priya.p@vol.org", role: "volunteer", skills: [], createdAt: now, lastActive: now },
  { uid: "user_027", displayName: "Marcus Johnson", email: "marcus.j@vol.org", role: "volunteer", skills: [], createdAt: now, lastActive: now },
  { uid: "user_028", displayName: "Sofia Garcia", email: "sofia.g@vol.org", role: "volunteer", skills: [], createdAt: now, lastActive: now },
  { uid: "user_029", displayName: "Tyler Brown", email: "tyler.b@vol.org", role: "volunteer", skills: [], createdAt: now, lastActive: now },
  { uid: "user_030", displayName: "Aisha Okonkwo", email: "aisha.o@vol.org", role: "volunteer", skills: [], createdAt: now, lastActive: now },
];
