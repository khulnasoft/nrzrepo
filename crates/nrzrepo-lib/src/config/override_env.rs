use std::{
    collections::HashMap,
    ffi::{OsStr, OsString},
};

use super::{env::truth_env_var, ConfigurationOptions, Error, ResolvedConfigurationOptions};
use crate::nrz_json::UIMode;

/*
Hi! If you're new here:
1. The general pattern is that:
  - ConfigurationOptions.token corresponds to NRZ_TOKEN or VERCEL_ARTIFACTS_TOKEN
  - ConfigurationOptions.team_id corresponds to NRZ_TEAMID or VERCEL_ARTIFACTS_OWNER
  - ConfigurationOptions.team_slug corresponds to NRZ_TEAM
1. We're ultimately poking around the env vars looking for _pairs_ that make sense.
   Since we presume that users are the only ones sending NRZ_* and Vercel is the only one sending VERCEL_*, we can make some assumptions.  Namely, we assume that if we have one of VERCEL_ARTIFACTS_OWNER or VERCEL_ARTIFACTS_TOKEN we will always have both.
1. Watch out for mixing up `NRZ_TEAM` and `NRZ_TEAMID`.  Same for ConfigurationOptions.team_id and ConfigurationOptions.team_slug.
*/

/// these correspond directly to the environment variables that this module
/// needs to do it's work
#[allow(non_snake_case)]
#[derive(Default, Debug, PartialEq)]
struct Input {
    NRZ_TEAM: Option<String>,
    NRZ_TEAMID: Option<String>,
    NRZ_TOKEN: Option<String>,
    VERCEL_ARTIFACTS_OWNER: Option<String>,
    VERCEL_ARTIFACTS_TOKEN: Option<String>,
}

impl Input {
    fn new() -> Self {
        Self::default()
    }
}

impl<'a> TryFrom<&'a HashMap<OsString, OsString>> for Input {
    type Error = Error;

    fn try_from(environment: &'a HashMap<OsString, OsString>) -> Result<Self, Self::Error> {
        let get_value = |key: &str| -> Result<Option<String>, Error> {
            let Some(value) = environment.get(OsStr::new(key)) else {
                return Ok(None);
            };
            let value = value
                .to_str()
                .ok_or_else(|| Error::Encoding(key.to_ascii_uppercase()))?;
            Ok(Some(value.to_string()))
        };
        Ok(Self {
            NRZ_TEAM: get_value("nrz_team")?,
            NRZ_TEAMID: get_value("nrz_teamid")?,
            NRZ_TOKEN: get_value("nrz_token")?,
            VERCEL_ARTIFACTS_OWNER: get_value("vercel_artifacts_owner")?,
            VERCEL_ARTIFACTS_TOKEN: get_value("vercel_artifacts_token")?,
        })
    }
}

// this is an internal structure (that's a partial of ConfigurationOptions) that
// we use to store
struct Output {
    /// maps to ConfigurationOptions.team_id
    team_id: Option<String>,
    // maps to ConfigurationOptions.team_slug
    team_slug: Option<String>,
    // maps to ConfigurationOptions.token
    token: Option<String>,
}

impl Output {
    fn new() -> Self {
        Self {
            team_id: None,
            team_slug: None,
            token: None,
        }
    }
}

impl From<Input> for Output {
    fn from(input: Input) -> Self {
        // NRZ_TEAMID+NRZ_TOKEN or NRZ_TEAM+NRZ_TOKEN
        if input.NRZ_TOKEN.is_some() && (input.NRZ_TEAMID.is_some() || input.NRZ_TEAM.is_some()) {
            Output {
                team_id: input.NRZ_TEAMID,
                team_slug: input.NRZ_TEAM,
                token: input.NRZ_TOKEN,
            }
        }
        // if there's both Vercel items, we use those next
        else if input.VERCEL_ARTIFACTS_TOKEN.is_some() && input.VERCEL_ARTIFACTS_OWNER.is_some() {
            Output {
                team_id: input.VERCEL_ARTIFACTS_OWNER,
                team_slug: input.NRZ_TEAM, /* this may or may not be Some, but if it is we can
                                            * pass it along too */
                token: input.VERCEL_ARTIFACTS_TOKEN,
            }
        }
        // from this point below, there's no token we can do anything with
        // ------------------------------------------------
        else {
            Output {
                // prefer NRZ_TEAMID to VERCEL_ARTIFACTS_OWNER
                team_id: input.NRZ_TEAMID.or(input.VERCEL_ARTIFACTS_OWNER),
                // No alternative source for team_slug so always use NRZ_TEAM
                team_slug: input.NRZ_TEAM,
                token: None,
            }
        }
    }
}

pub struct OverrideEnvVars<'a> {
    environment: &'a HashMap<OsString, OsString>,
    output: Output,
}

impl<'a> OverrideEnvVars<'a> {
    pub fn new(environment: &'a HashMap<OsString, OsString>) -> Result<Self, Error> {
        let input = Input::try_from(environment)?;
        let output = Output::from(input);

        Ok(Self {
            environment,
            output,
        })
    }

    fn ui(&self) -> Option<UIMode> {
        let value = self
            .environment
            .get(OsStr::new("ci"))
            .or_else(|| self.environment.get(OsStr::new("no_color")))?;
        truth_env_var(value.to_str()?)?.then_some(UIMode::Stream)
    }
}

impl<'a> ResolvedConfigurationOptions for OverrideEnvVars<'a> {
    fn get_configuration_options(
        &self,
        _existing_config: &ConfigurationOptions,
    ) -> Result<ConfigurationOptions, Error> {
        let output = ConfigurationOptions {
            team_id: self.output.team_id.clone(),
            token: self.output.token.clone(),
            team_slug: self.output.team_slug.clone(),
            ui: self.ui(),
            ..Default::default()
        };
        Ok(output)
    }
}

#[cfg(test)]
mod test {
    use super::*;

    const VERCEL_ARTIFACTS_OWNER: &str = "valueof:VERCEL_ARTIFACTS_OWNER";
    const VERCEL_ARTIFACTS_TOKEN: &str = "valueof:VERCEL_ARTIFACTS_TOKEN";
    const NRZ_TEAMID: &str = "valueof:NRZ_TEAMID";
    const NRZ_TEAM: &str = "valueof:NRZ_TEAM";
    const NRZ_TOKEN: &str = "valueof:NRZ_TOKEN";

    struct TestCase {
        input: Input,
        output: Output,
        reason: &'static str,
    }

    impl TestCase {
        fn new() -> Self {
            Self {
                input: Input::new(),
                output: Output::new(),
                reason: "missing",
            }
        }

        fn reason(mut self, reason: &'static str) -> Self {
            self.reason = reason;
            self
        }

        #[allow(non_snake_case)]
        fn VERCEL_ARTIFACTS_OWNER(mut self) -> Self {
            self.input.VERCEL_ARTIFACTS_OWNER = Some(VERCEL_ARTIFACTS_OWNER.into());
            self
        }

        #[allow(non_snake_case)]
        fn VERCEL_ARTIFACTS_TOKEN(mut self) -> Self {
            self.input.VERCEL_ARTIFACTS_TOKEN = Some(VERCEL_ARTIFACTS_TOKEN.into());
            self
        }

        #[allow(non_snake_case)]
        fn NRZ_TEAMID(mut self) -> Self {
            self.input.NRZ_TEAMID = Some(NRZ_TEAMID.into());
            self
        }

        #[allow(non_snake_case)]
        fn NRZ_TEAM(mut self) -> Self {
            self.input.NRZ_TEAM = Some(NRZ_TEAM.into());
            self
        }

        #[allow(non_snake_case)]
        fn NRZ_TOKEN(mut self) -> Self {
            self.input.NRZ_TOKEN = Some(NRZ_TOKEN.into());
            self
        }

        fn team_id(mut self, value: &str) -> Self {
            self.output.team_id = Some(value.into());
            self
        }

        fn team_slug(mut self, value: &str) -> Self {
            self.output.team_slug = Some(value.into());
            self
        }

        fn token(mut self, value: &str) -> Self {
            self.output.token = Some(value.into());
            self
        }
    }

    #[test]
    fn test_all_the_combos() {
        let cases: &[TestCase] = &[
            //
            // Get nothing back
            // ------------------------------
            TestCase::new().reason("no env vars set"),
            TestCase::new()
                .reason("just VERCEL_ARTIFACTS_TOKEN")
                .VERCEL_ARTIFACTS_TOKEN(),
            TestCase::new().reason("just NRZ_TOKEN").NRZ_TOKEN(),
            //
            // When 3rd Party Wins with all three
            // ------------------------------
            TestCase::new()
                .reason("we can use all of NRZ_TEAM, NRZ_TEAMID, and NRZ_TOKEN")
                .NRZ_TEAM()
                .NRZ_TEAMID()
                .NRZ_TOKEN()
                .team_id(NRZ_TEAMID)
                .team_slug(NRZ_TEAM)
                .token(NRZ_TOKEN),
            TestCase::new()
                .reason("if we have a 3rd party trifecta, that wins, even against a Vercel Pair")
                .NRZ_TEAM()
                .NRZ_TEAMID()
                .NRZ_TOKEN()
                .VERCEL_ARTIFACTS_OWNER()
                .VERCEL_ARTIFACTS_TOKEN()
                .team_id(NRZ_TEAMID)
                .team_slug(NRZ_TEAM)
                .token(NRZ_TOKEN),
            TestCase::new()
                .reason("a 3rd party trifecta wins against a partial Vercel (just artifacts token)")
                .NRZ_TEAM()
                .NRZ_TEAMID()
                .NRZ_TOKEN()
                .VERCEL_ARTIFACTS_TOKEN()
                .team_id(NRZ_TEAMID)
                .team_slug(NRZ_TEAM)
                .token(NRZ_TOKEN),
            TestCase::new()
                .reason("a 3rd party trifecta wins against a partial Vercel (just artifacts owner)")
                .NRZ_TEAM()
                .NRZ_TEAMID()
                .NRZ_TOKEN()
                .VERCEL_ARTIFACTS_OWNER()
                .team_id(NRZ_TEAMID)
                .team_slug(NRZ_TEAM)
                .token(NRZ_TOKEN),
            //
            // When 3rd Party Wins with team_slug
            // ------------------------------
            TestCase::new()
                .reason("golden path for 3rd party, not deployed on Vercel")
                .NRZ_TEAM()
                .NRZ_TOKEN()
                .team_slug(NRZ_TEAM)
                .token(NRZ_TOKEN),
            TestCase::new()
                .reason(
                    "a NRZ_TEAM+NRZ_TOKEN pair wins against an incomplete Vercel (just artifacts \
                     token)",
                )
                .NRZ_TEAM()
                .NRZ_TOKEN()
                .VERCEL_ARTIFACTS_TOKEN() // disregarded
                .team_slug(NRZ_TEAM)
                .token(NRZ_TOKEN),
            TestCase::new()
                .reason("golden path for 3rd party, deployed on Vercel")
                .NRZ_TEAM()
                .NRZ_TOKEN()
                .VERCEL_ARTIFACTS_OWNER() // normally this would map to team_id, but not with a complete 3rd party pair
                .VERCEL_ARTIFACTS_TOKEN()
                .team_slug(NRZ_TEAM)
                .token(NRZ_TOKEN),
            //
            // When 3rd Party Wins with team_id
            // ------------------------------
            TestCase::new()
                .reason("if they pass a NRZ_TEAMID and a NRZ_TOKEN, we use them")
                .NRZ_TEAMID()
                .NRZ_TOKEN()
                .team_id(NRZ_TEAMID)
                .token(NRZ_TOKEN),
            TestCase::new()
                .reason("a NRZ_TEAMID+NRZ_TOKEN pair will also win against a Vercel pair")
                .NRZ_TEAMID()
                .NRZ_TOKEN()
                .VERCEL_ARTIFACTS_OWNER()
                .VERCEL_ARTIFACTS_TOKEN()
                .team_id(NRZ_TEAMID)
                .token(NRZ_TOKEN),
            TestCase::new()
                .reason(
                    "a NRZ_TEAMID+NRZ_TOKEN pair wins against an incomplete Vercel (just \
                     artifacts token)",
                )
                .NRZ_TEAMID()
                .NRZ_TOKEN()
                .VERCEL_ARTIFACTS_TOKEN()
                .team_id(NRZ_TEAMID)
                .token(NRZ_TOKEN),
            //
            // When Vercel Wins
            // ------------------------------
            TestCase::new()
                .reason("golden path on Vercel zero config")
                .VERCEL_ARTIFACTS_OWNER()
                .VERCEL_ARTIFACTS_TOKEN()
                .team_id(VERCEL_ARTIFACTS_OWNER)
                .token(VERCEL_ARTIFACTS_TOKEN),
            TestCase::new()
                .reason("Vercel wins: disregard just NRZ_TOKEN")
                .NRZ_TOKEN()
                .VERCEL_ARTIFACTS_OWNER()
                .VERCEL_ARTIFACTS_TOKEN()
                .team_id(VERCEL_ARTIFACTS_OWNER)
                .token(VERCEL_ARTIFACTS_TOKEN),
            TestCase::new()
                .reason("Vercel wins: NRZ_TEAM can join in the fun if it wants")
                .NRZ_TEAM()
                .VERCEL_ARTIFACTS_OWNER()
                .VERCEL_ARTIFACTS_TOKEN()
                .team_id(VERCEL_ARTIFACTS_OWNER)
                .team_slug(NRZ_TEAM)
                .token(VERCEL_ARTIFACTS_TOKEN),
            TestCase::new()
                .reason("Vercel wins: disregard just NRZ_TEAMID")
                .NRZ_TEAMID()
                .VERCEL_ARTIFACTS_OWNER()
                .VERCEL_ARTIFACTS_TOKEN()
                .team_id(VERCEL_ARTIFACTS_OWNER)
                .token(VERCEL_ARTIFACTS_TOKEN),
            TestCase::new()
                .reason("Vercel wins if NRZ_TOKEN is missing")
                .NRZ_TEAM()
                .NRZ_TEAMID()
                .VERCEL_ARTIFACTS_OWNER()
                .VERCEL_ARTIFACTS_TOKEN()
                .team_id(VERCEL_ARTIFACTS_OWNER)
                .team_slug(NRZ_TEAM)
                .token(VERCEL_ARTIFACTS_TOKEN),
            //
            // Just get a team_id
            // ------------------------------
            TestCase::new()
                .reason("just VERCEL_ARTIFACTS_OWNER")
                .VERCEL_ARTIFACTS_OWNER()
                .team_id(VERCEL_ARTIFACTS_OWNER),
            TestCase::new()
                .reason("just NRZ_TEAMID")
                .NRZ_TEAMID()
                .team_id(NRZ_TEAMID),
            //
            // Just get a team_slug
            // ------------------------------
            TestCase::new()
                .reason("just NRZ_TEAM")
                .NRZ_TEAM()
                .team_slug(NRZ_TEAM),
            //
            // just team_slug and team_id
            // ------------------------------
            TestCase::new()
                .reason("if we just have NRZ_TEAM+NRZ_TEAMID, that's ok")
                .NRZ_TEAM()
                .NRZ_TEAMID()
                .team_slug(NRZ_TEAM)
                .team_id(NRZ_TEAMID),
            //
            // just set team_id and team_slug
            // ------------------------------
            TestCase::new()
                .reason("if we just have a NRZ_TEAM and NRZ_TEAMID we can use them both")
                .NRZ_TEAM()
                .NRZ_TEAMID()
                .team_id(NRZ_TEAMID)
                .team_slug(NRZ_TEAM),
        ];

        for case in cases {
            let mut env: HashMap<OsString, OsString> = HashMap::new();

            if let Some(value) = &case.input.NRZ_TEAM {
                env.insert("nrz_team".into(), value.into());
            }
            if let Some(value) = &case.input.NRZ_TEAMID {
                env.insert("nrz_teamid".into(), value.into());
            }
            if let Some(value) = &case.input.NRZ_TOKEN {
                env.insert("nrz_token".into(), value.into());
            }
            if let Some(value) = &case.input.VERCEL_ARTIFACTS_OWNER {
                env.insert("vercel_artifacts_owner".into(), value.into());
            }
            if let Some(value) = &case.input.VERCEL_ARTIFACTS_TOKEN {
                env.insert("vercel_artifacts_token".into(), value.into());
            }

            let actual_input = Input::try_from(&env).unwrap();
            assert_eq!(case.input, actual_input);

            let config = OverrideEnvVars::new(&env).unwrap();
            let reason = case.reason;

            assert_eq!(case.output.team_id, config.output.team_id, "{reason}");
            assert_eq!(case.output.team_slug, config.output.team_slug, "{reason}");
            assert_eq!(case.output.token, config.output.token, "{reason}");
        }
    }
}
