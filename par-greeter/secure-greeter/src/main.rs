/*
 * Copyright 2020 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

use fluence::fce;
use fluence::module_manifest;

mod auth;
use crate::auth::is_owner;

module_manifest!();

pub fn main() {}

#[fce]
#[derive(Debug)]
pub struct Gresult {
    pub greeting: String,
    pub err_str: String,
}

#[fce]
pub fn greeting(name: String) -> Gresult {
    if !is_owner() {
        return Gresult {
            greeting: "".into(),
            err_str: "You are not the owner".into(),
        };
    }
    Gresult {
        greeting: format!("Hi, {}", name),
        err_str: "".into(),
    }
}
