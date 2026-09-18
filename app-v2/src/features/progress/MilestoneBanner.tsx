import type { Achievement, EarnedMilestone } from "../../domain/milestones";
import { formatDuration } from "../../domain/trainingEngine";

export interface Celebration {
  milestones: EarnedMilestone[];
  achievements: Achievement[];
}

export function MilestoneBanner({
  celebration,
  onDismiss
}: {
  celebration: Celebration;
  onDismiss: () => void;
}) {
  const { milestones, achievements } = celebration;
  const topMilestone = milestones.at(-1);

  return (
    <section className="celebration-banner" role="status">
      <div className="celebration-lines">
        {topMilestone && (
          <p>
            <strong>
              {milestones.length > 1
                ? `${milestones.length} milestones at once, up to ${topMilestone.label} alone.`
                : `Milestone: ${topMilestone.label} alone.`}
            </strong>{" "}
            {formatDuration(topMilestone.actualSeconds)} relaxed in {topMilestone.scenarioLabel}.
          </p>
        )}
        {achievements.map((achievement) => (
          <p key={achievement.id}>
            <strong>{achievement.title}.</strong> {achievement.detail}
          </p>
        ))}
      </div>
      <button className="text-button celebration-dismiss" onClick={onDismiss}>
        Dismiss
      </button>
    </section>
  );
}
