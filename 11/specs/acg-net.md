# ACG-NET

**Autonomous Creative Guild Network**

> A P2P protocol for creative nodes. No central authority. Mesh topology. You are your work.

---

## Abstract

ACG-NET defines a peer-to-peer protocol for creative nodes to discover each other, share work, and form temporary guilds around projects. There are no servers. There is no platform. There is no algorithm deciding who sees what. Nodes find each other through resonance — shared patterns in their work — and form guilds that last exactly as long as the project requires.

---

## 1. Purpose

To specify a decentralized network where:

- Creative individuals (nodes) operate autonomously
- Discovery is based on work similarity, not social graph
- Collaboration is temporary, project-scoped, and voluntary
- Identity is defined by output, not credentials
- No node has authority over any other node

## 2. Definitions

| Term | Definition |
|------|-----------|
| **Node** | A creative entity on the network. A person, a collective, an AI — anything that produces work. |
| **Guild** | A temporary association of nodes formed around a shared project. Guilds dissolve when the project completes. |
| **Mersenne Shield** | A node's identity vector. 127-dimensional. Derived from the node's body of work. Not a username — a fingerprint of creative output. |
| **Resonance Score** | A measure of pattern similarity between two Mersenne Shields. High resonance = similar creative DNA. |
| **Beacon** | A broadcast signal a node emits to announce availability for guild formation. Contains project parameters and resonance requirements. |
| **Handshake** | The protocol by which two nodes verify mutual resonance and agree to form or join a guild. |

## 3. Network Topology

### 3.1 Mesh Structure

ACG-NET is a full mesh network. Every node can connect to every other node. There are no supernodes, no hubs, no privileged positions. Routing is gossip-based — messages propagate through the network like rumors, dying out when they stop resonating.

### 3.2 Discovery

Nodes discover each other through resonance matching:

1. Node A emits a Beacon containing its Mersenne Shield and project parameters
2. Nearby nodes compute resonance score against their own shield
3. If resonance exceeds threshold, node responds with a Handshake request
4. Mutual resonance verification occurs
5. If both nodes agree, a guild link is established

### 3.3 No Central Registry

There is no directory. There is no search engine. You find collaborators the way you find them in real life — by putting work out and seeing who responds. The network topology IS the discovery mechanism.

## 4. Mersenne Shield

### 4.1 Construction

A Mersenne Shield is a 127-dimensional identity vector (127 being the exponent of the largest known Mersenne prime at the time of initial spec). Each dimension represents a creative axis:

- Dimensions 1-32: Medium (visual, audio, text, code, movement, etc.)
- Dimensions 33-64: Style (tempo, density, palette, structure, etc.)
- Dimensions 65-96: Theme (subject matter fingerprint)
- Dimensions 97-127: Process (how the work is made — tools, methods, rhythms)

### 4.2 Derivation

The shield is derived from the node's body of work. Not self-reported — computed. You don't describe yourself; your work describes you. The shield updates as new work is produced, drifting through the 127-dimensional space as the node's creative practice evolves.

### 4.3 Privacy

A Mersenne Shield reveals creative fingerprint but not identity. Two nodes can have high resonance without knowing each other's names. Pseudonymity is the default. Nodes may choose to reveal identity within a guild, but the protocol never requires it.

## 5. Guild Protocol

### 5.1 Formation

1. A node emits a Beacon with project scope and minimum resonance threshold
2. Responding nodes form a candidate pool
3. The initiating node (or the group by consensus) selects guild members
4. Guild is instantiated with a shared workspace and communication channel

### 5.2 Operation

- All guild members have equal authority
- Decisions require consensus (configurable threshold)
- Work products belong to the guild collectively
- Any member may leave at any time without penalty

### 5.3 Dissolution

A guild dissolves when:

- The project is complete (all members agree)
- Membership drops below minimum viable (configurable)
- Inactivity exceeds timeout (configurable)
- Any member invokes emergency dissolution

On dissolution, work products are distributed to all members. The guild's existence is recorded in each member's Mersenne Shield as experience.

## 6. Conformance

An implementation is ACG-NET conformant if:

1. No node has elevated privileges over any other
2. Discovery is resonance-based, not search-based
3. Identity is work-derived, not self-declared
4. Guilds are temporary and voluntary
5. The protocol functions without any central server

## 7. Notes

ACG-NET is what the internet was supposed to be before platforms ate it. A mesh of creative equals, finding each other through the quality and character of their work. No followers. No likes. No algorithm. Just resonance.

---

*ACG-NET v1.0 — Ring 4 — p=11 — specs/*
