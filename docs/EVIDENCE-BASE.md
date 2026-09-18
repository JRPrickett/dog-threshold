# Evidence base and training-engine decisions

Last reviewed: 18 September 2026

Threshold is a training/planning aid, not a diagnostic or veterinary product. This document
separates what is supported by published evidence from the product heuristics we use to turn
that evidence into a practical app.

## What the evidence supports

### Systematic desensitisation is the central behavioural principle

Butler, Sargisson & Elliffe (2011) followed eight dogs with separation-related behaviour in a
controlled within-subject study. An owner-applied programme centred on systematic
desensitisation was associated with significant reductions in the frequency and severity of
problem behaviour. The study was small, but it remains directly relevant because it measured
behaviour repeatedly rather than relying only on a retrospective questionnaire.

The practical principle is:

- begin with an absence mild enough not to evoke distress;
- repeat exposure at tolerable intensity;
- introduce more difficult separations gradually;
- adjust to the individual dog rather than forcing a fixed calendar.

Source:
Butler R, Sargisson RJ, Elliffe D. Applied Animal Behaviour Science. 2011;129(2-4):136-145.
DOI: 10.1016/j.applanim.2010.11.001

### A perfectly smooth increase is not required

In the same study, treatment success was not associated with how consistently owners increased
the length of consecutive separations. Separation duration and symptom severity were also not
significantly correlated for six of seven dogs with complete duration data.

Threshold therefore should not claim that a precise mathematical percentage increase is
scientifically necessary. The product should favour conservative, comprehensible steps and
allow easier/shorter sessions whenever appropriate.

### Direct observation is valuable

Palestrini et al. (2010) filmed 23 dogs with separation-related problems. Common observed
behaviours included vocalisation, orientation to the environment, panting and destruction.
Many signs appeared early after departure. The authors argued that direct video observation is
preferable for diagnosis and measuring behavioural change when practical.

Threshold should encourage users to observe with an existing pet camera/phone and record what
they actually saw rather than infer state only from elapsed time.

Source:
Palestrini C et al. Applied Animal Behaviour Science. 2010;124(1-2):61-67.
DOI: 10.1016/j.applanim.2010.01.014

### Behaviour modification evidence is limited and heterogeneous

A 2024 systematic review of counterconditioning-based dog behaviour interventions found
substantial variation in definitions and implementation, small samples, and limited
generalisability. Separation-related behaviour appeared relatively resistant to change.

Threshold therefore must not present any generated target as a clinically validated prescription
or promise a universal timeline.

Source:
Shnookal J, Tepper D, Howell T, Bennett P. Applied Animal Behaviour Science. 2024;276:106305.
DOI: 10.1016/j.applanim.2024.106305

### Prevention/habituation evidence remains exploratory

A 2026 double-blind puppy study found associations between calm-owner / gradual-alone-time advice
and increased inactivity while puppies were alone, but the sample was small and advice did not
significantly reduce active separation-related behaviours. This supports cautious language around
prevention claims.

Source:
Dale FC, Casey RA, Burn CC. Journal of Veterinary Behavior. 2026;83:52-68.
DOI: 10.1016/j.jveb.2025.11.002

## What the evidence does NOT establish

Published research does not establish a universal rule such as:

- increase by 5%, then 8%, then 10%;
- reduce by exactly 20% after two difficult sessions;
- perform exactly two sessions per day;
- insert an easy session every fourth session;
- use a particular number or percentage of warm-up departures.

Those were reasonable prototype heuristics, but they must not be described as evidence-based
dosage rules.

## Production engine philosophy

The production recommendation engine follows these principles:

1. **Known-comfortable starting point**
   The user enters a duration they have already observed their dog coping with calmly. We do not
   ask users to deliberately push until distress to discover a maximum threshold.

2. **Repeat before increasing**
   One relaxed result is treated as useful evidence, but the app normally asks for another
   comfortable repetition before increasing difficulty.

3. **Small, transparent step sizes**
   When the app increases duration, it uses simple tiered time increments. These increments are
   product heuristics chosen for conservatism and usability, not clinically validated values.

4. **Concern means reduce difficulty**
   "Some concern" does not trigger an increase. The next target returns toward a recently
   demonstrated comfortable duration or takes one conservative step down.

5. **Distress means return to known comfort**
   A distressed session returns to the most recent known relaxed duration. If there is no such
   session, the configured starting duration is used.

6. **Early return is good handling, not failure**
   If the owner returns early while the dog is still relaxed, the actual duration is treated as a
   known-comfortable data point. The next session does not automatically exceed it.

7. **Repeated difficulty triggers support, not algorithmic aggression**
   Several concern/distress ratings in a short window surface a recommendation to reduce
   difficulty and consider professional support.

8. **Duration is not the only outcome**
   The app can optionally record observed signs such as pacing, panting, exit-watching, whining,
   barking/howling and inability to settle.

9. **Explain every recommendation**
   The UI must show why a target was held, increased or reduced.

## Product heuristics: current step sizes

The initial production engine uses human-readable absolute increments:

- under 10 s: +1 s
- 10-29 s: +2 s
- 30-59 s: +3 s
- 1-2 min: +5 s
- 2-5 min: +10 s
- 5-10 min: +15 s
- 10-30 min: +30 s
- over 30 min: +60 s

These numbers are deliberately modest and easy to understand. They are not presented as a
scientific formula and should be reviewed with a qualified behaviour professional before public
beta.

## Outcome language

Production UI:

- **Relaxed** — no meaningful signs of concern; able to settle/behave normally.
- **Some concern** — mild or transient signs such as sustained exit-watching, pacing, panting or
  isolated vocalisation.
- **Distressed** — clear or escalating inability to cope, repeated vocalisation, frantic movement,
  destructive/escape behaviour, self-injury risk or other obvious distress.

The app should always encourage returning before distress develops.

## Professional review gate

Before public launch, a qualified veterinary behaviourist or appropriately credentialled canine
behaviour professional should review:

- onboarding and safety wording;
- outcome descriptions;
- progression / reduction heuristics;
- departure-cue exercises;
- professional-support escalation wording.

The review should be documented as review of product content and heuristics, not as an endorsement
claim unless explicit permission is obtained.
