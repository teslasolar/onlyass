# Project Resonance

**Earth-Scale Communication via Schumann Resonance Frequencies**

> Encoding data in the electromagnetic heartbeat of the planet.

---

## Abstract

Project Resonance specifies a theoretical framework for planetary-scale low-bandwidth communication by encoding data in the Schumann resonance frequencies — the electromagnetic standing waves that exist in the cavity between Earth's surface and the ionosphere. This is extremely speculative. This is also structured as a real engineering spec, because the physics is real even if the implementation isn't.

---

## 1. Background

### 1.1 Schumann Resonances

The Earth-ionosphere cavity acts as a waveguide. Lightning strikes excite electromagnetic standing waves in this cavity at predictable frequencies:

| Mode | Frequency | Wavelength |
|------|-----------|------------|
| 1st | 7.83 Hz | ~38,000 km (circumference of Earth) |
| 2nd | 14.3 Hz | ~21,000 km |
| 3rd | 20.8 Hz | ~14,400 km |
| 4th | 27.3 Hz | ~11,000 km |
| 5th | 33.8 Hz | ~8,900 km |

These resonances are always present. They are excited by the ~2,000 lightning storms occurring on Earth at any given moment. They are detectable anywhere on the planet with sufficiently sensitive ELF (Extremely Low Frequency) receivers.

### 1.2 Key Properties

- **Global coverage:** Standing waves fill the entire Earth-ionosphere cavity. No line-of-sight required. No satellites required. No infrastructure required beyond transmitter and receiver.
- **Penetration:** ELF waves penetrate seawater, rock, and buildings. Submarines have used ELF for decades.
- **Persistence:** The resonances have existed for as long as Earth has had an ionosphere (~3.5 billion years). They are not going away.
- **Bandwidth:** Extremely low. Single-digit Hz carrier frequencies mean fractions of a bit per second at best.

## 2. System Architecture

### 2.1 Transmitter

**Challenge:** To inject a detectable signal into the Schumann resonance, you need to modulate the Earth-ionosphere cavity. This requires either:

- A very large antenna (ground dipole, tens of km)
- A very high-power ELF transmitter (MW range)
- Modulation of the ionosphere itself (via HF heating, e.g., HAARP-class facility)

**Proposed approach:** Phase modulation of the 7.83 Hz fundamental. Rather than overpowering the natural resonance, encode data as subtle phase shifts in the standing wave. The natural resonance provides the carrier; the transmitter provides the modulation.

### 2.2 Receiver

An array of magnetometers sensitive to ELF frequencies (1-50 Hz range). Multiple geographically distributed receivers enable:

- Signal averaging to improve SNR
- Direction finding via phase comparison
- Rejection of local electromagnetic interference

Minimum viable receiver: an induction coil magnetometer with ~1 fT/sqrt(Hz) sensitivity, GPS-disciplined timing, and DSP capability for sub-Hz resolution.

### 2.3 Encoding

Given the extreme bandwidth constraints (~0.1-1 bps theoretical maximum):

| Layer | Method | Purpose |
|-------|--------|---------|
| Physical | Phase-shift keying on 7.83 Hz carrier | Bit transmission |
| Framing | Fixed-length frames with sync preamble | Frame alignment |
| Error correction | Heavy FEC (rate 1/10 or lower) | Reliability in noise |
| Application | Pre-defined message dictionary | Maximize information per bit |

### 2.4 Bandwidth Budget

- Carrier: 7.83 Hz
- Practical modulation bandwidth: ~0.1 Hz (Q factor of cavity limits modulation rate)
- Raw bit rate: ~0.1 bps
- After FEC: ~0.01 bps
- Effective throughput: ~1 bit per 100 seconds
- A 128-bit message takes: ~3.5 hours

This is not a bug. This is a feature. Project Resonance is not for streaming video. It is for transmitting meaning at planetary timescales.

## 3. Message Format

Given the extreme bandwidth constraint, messages are pre-defined indices into a shared codebook:

```
[ SYNC | MSG_ID | PAYLOAD | CRC ]
  8 bit  8 bit   variable  16 bit
```

- **SYNC:** Fixed pattern for frame detection (10110010)
- **MSG_ID:** Message type (256 possible types)
- **PAYLOAD:** Type-dependent, 0-128 bits
- **CRC:** Error detection

### 3.1 Example Message Types

| MSG_ID | Type | Payload | Meaning |
|--------|------|---------|---------|
| 0x00 | HEARTBEAT | None | "I am here" |
| 0x01 | BEACON | 16-bit node ID | "Node [ID] is active" |
| 0x02 | ALERT | 8-bit severity + 8-bit type | "Attention needed" |
| 0x03 | TIMESTAMP | 32-bit epoch | "The time is [T]" |
| 0xFF | RAW | 128 bits | Freeform (3.5 hours to transmit) |

## 4. Threat Model

### 4.1 Detection

Any sufficiently sensitive ELF receiver can detect transmissions. Schumann resonance communication is not covert — it is broadcast. Privacy must be provided at a higher layer (encryption of payload).

### 4.2 Jamming

Jamming the Schumann resonance would require overpowering the planet's natural ELF background. This is theoretically possible but practically difficult and ecologically questionable.

### 4.3 Spoofing

Without authentication, any transmitter can inject messages. Payload-level digital signatures (expensive in bits) or pre-shared key authentication are required for trusted communication.

## 5. Applications

- **Planetary clock synchronization.** A single timestamp broadcast receivable everywhere on Earth, including underground and underwater.
- **Existential risk beacon.** A simple "I am here" heartbeat that persists as long as civilization can power a transmitter.
- **Civilization-scale paging.** Send a 256-type message to every point on the planet simultaneously.
- **Deep time communication.** Messages encoded in Earth's electromagnetic field, receivable by any future civilization that discovers ELF.

## 6. Status

Theoretical. No implementation exists. The physics is sound. The engineering is extreme. The bandwidth is terrible. The coverage is total.

---

*Project Resonance v1.0 — Ring 4 — p=11 — specs/*
