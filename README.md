# TrashBack Prototype (Hackathon Edition)

TrashBack is a behavioral prototype demonstrating incentive-based waste disposal. It uses a Scan → Dispose → Reward loop to encourage responsible plastic disposal. This version is built for judges and hackathon presentations, featuring cheat-resistance and measurable impact metrics.

## CORE PRINCIPLE
**"We didn’t change awareness. We changed incentives."**

## System Features (Hackathon-Grade)
- 🛡️ **Cheat-Resistant**: Mandatory plastic code format (`TB-PLASTIC-XXXX`).
- 🚫 **Reuse Prevention**: Each code is unique and can only be redeemed once.
- ⏳ **Anti-Abuse**: Strict limit of **3 scans per day** per device.
- ⚖️ **Ethical Check**: Mandatory disposal confirmation before points are awarded.
- 📊 **Measurable Impact**: Real-time calculation of plastic grams saved (20g/item).
- 🎫 **Meaningful Rewards**: 10 points = 1 Mock Discount Coupon.

## Demo Assumptions (Mandatory Disclosure)
- **Codes are simulated** for prototype purposes.
- **Disposal is user-confirmed** (Ethical assumption).
- **Rewards are symbolic** (Demonstrative behavior loop).
- **System evaluates behavior**, not recycling logistics or brand APIs.

## Presentation Demo Flow
1. **The Problem**: Mention the ₹5 cashback bottle story. Awareness exists, but incentives are missing.
2. **The Logic**: Open the User Dashboard. Show the "Green Impact" section.
3. **The Demo**:
   - Use a demo code like `TB-PLASTIC-1001`.
   - Show that it fails if the "Ethical Confirmation" is not checked.
   - Show successful redemption.
   - Try the same code again to show **Reuse Prevention**.
4. **The Scale**: Open the **Admin Dashboard**.
   - Show total grams of plastic saved.
   - Show the verification logs.
5. **Conclusion**: "Plastic is not currency. Plastic is proof of responsible behavior."

## Technical Stack
- **HTML5/CSS3**: Vanilla architecture with Glassmorphism UI.
- **JavaScript**: Core logic engine with zero dependencies.
- **Data**: Persisted via `localStorage` (Demo-safe storage).

---
> TrashBack is a behavioral prototype demonstrating incentive-based waste disposal, not a real recycling system.
