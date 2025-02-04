use std::fmt::{self, Formatter};

use chrono::{DateTime, Duration, Local, SubsecRound};

#[derive(Debug)]
pub struct NrzDuration(Duration);

impl NrzDuration {
    pub fn new(start_time: &DateTime<Local>, end_time: &DateTime<Local>) -> Self {
        NrzDuration(
            end_time
                .trunc_subsecs(3)
                .signed_duration_since(start_time.trunc_subsecs(3)),
        )
    }
}

impl From<Duration> for NrzDuration {
    fn from(duration: Duration) -> Self {
        Self(duration)
    }
}

impl fmt::Display for NrzDuration {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        let duration = &self.0;

        // If duration is less than a second, we print milliseconds
        if duration.num_seconds() <= 0 {
            let milliseconds = duration.num_milliseconds() - duration.num_seconds() * 1000;
            return write!(f, "{}ms", milliseconds);
        }

        if duration.num_hours() > 0 {
            write!(f, "{}h", duration.num_hours(),)?;
        }

        if duration.num_minutes() > 0 {
            let minutes = duration.num_minutes() - duration.num_hours() * 60;
            write!(f, "{}m", minutes)?;
        }

        if duration.num_seconds() > 0 {
            let seconds_in_ms = duration.num_milliseconds() - duration.num_minutes() * 60 * 1000;
            let seconds = (seconds_in_ms as f64) / 1000.0;
            write!(f, "{}s", seconds)?;
        }

        Ok(())
    }
}

#[cfg(test)]
mod test {
    use pretty_assertions::assert_eq;
    use test_case::test_case;

    use super::*;

    #[test_case(NrzDuration::from(Duration::milliseconds(120)), "120ms")]
    #[test_case(NrzDuration::from(Duration::milliseconds(1500)), "1.5s")]
    #[test_case(NrzDuration::from(Duration::milliseconds(1234)), "1.234s")]
    #[test_case(NrzDuration::from(Duration::seconds(90)), "1m30s")]
    fn duration_formatting(duration: NrzDuration, expected: &str) {
        assert_eq!(duration.to_string(), expected);
    }
}
