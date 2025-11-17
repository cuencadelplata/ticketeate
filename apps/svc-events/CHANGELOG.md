# Changelog

Todas las versiones notables de **svc-events** serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

# [1.7.0](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.6.0...svc-events-v1.7.0) (2025-11-17)


### Bug Fixes

* stop auto-refetching and ensure scanned tickets update ([e968833](https://github.com/cuencadelplata/ticketeate/commit/e968833e91e1b9fd54ddd1f8c396f1ac830192b0))
* use correct API URL and allow public access to event details ([55fa3ef](https://github.com/cuencadelplata/ticketeate/commit/55fa3ef36759b9f9cbf1c8718b96920b735926c0))
* use correct API URL and allow public access to event details ([#182](https://github.com/cuencadelplata/ticketeate/issues/182)) ([f417522](https://github.com/cuencadelplata/ticketeate/commit/f4175225faee325cdf2ab2cedf75dacc442091fa))


### Features

* **mercadopago:** add platform_id and no-PKCE testing endpoint ([#183](https://github.com/cuencadelplata/ticketeate/issues/183)) ([0a63bdd](https://github.com/cuencadelplata/ticketeate/commit/0a63bddada936d256f84b261eb32c39fc3854686))
* **mercadopago:** add platform_id and no-PKCE testing endpoint ([c47b1c2](https://github.com/cuencadelplata/ticketeate/commit/c47b1c22ba9459a27c74cf7a3e4200a88ce57b08))

# [1.6.0](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.5.0...svc-events-v1.6.0) (2025-11-17)


### Bug Fixes

* add API Gateway routes for /api/invite-codes endpoints ([3133db4](https://github.com/cuencadelplata/ticketeate/commit/3133db498619721e2880c92a39218c3b97732265))
* add CORS headers and OPTIONS handler to invite-codes routes ([17825e2](https://github.com/cuencadelplata/ticketeate/commit/17825e2ed3310d3060292ceb224703e7cb2eaea6))
* add CORS headers and OPTIONS handler to invite-codes routes ([#181](https://github.com/cuencadelplata/ticketeate/issues/181)) ([158ee41](https://github.com/cuencadelplata/ticketeate/commit/158ee41c1fa510b5af61c211105e08f01df08a9b))
* **next-frontend:** add MERCADOPAGO_WEBHOOK_SECRET to docker build args and github workflow ([e84a926](https://github.com/cuencadelplata/ticketeate/commit/e84a926ebbc9fad66ec596c22a193c8444b2acc1))
* avoid constant refetches on scanner page and add attendee list ([46b3ca3](https://github.com/cuencadelplata/ticketeate/commit/46b3ca35e7f2d600e52470dafbb9300788fdc850))
* correct API_BASE URL construction in invite-codes hook ([0af5a55](https://github.com/cuencadelplata/ticketeate/commit/0af5a55978e1e81f6adef2ed40dd3e3f0f6bce66))
* correct API_BASE URL construction in invite-codes hook  ([#177](https://github.com/cuencadelplata/ticketeate/issues/177)) ([b7d985f](https://github.com/cuencadelplata/ticketeate/commit/b7d985f3fab91b2d8eb50fb1b7de59f9b2e063d6))
* **mercadopago:** correct OAuth client ([#176](https://github.com/cuencadelplata/ticketeate/issues/176)) ([5913340](https://github.com/cuencadelplata/ticketeate/commit/5913340611f4ef0bcdfb947b51c96ea06650b934))
* **mercadopago:** correct OAuth client credentials ([5b7173e](https://github.com/cuencadelplata/ticketeate/commit/5b7173ed06b99da03664c1d216305eb1a0a18008))
* CORS handling for invite-codes endpoint - add OPTIONS method check ([c2cfdeb](https://github.com/cuencadelplata/ticketeate/commit/c2cfdeb4631a44023004da8439f789d60eadb36b))
* remove invalid html5-qrcode configuration option ([367e04f](https://github.com/cuencadelplata/ticketeate/commit/367e04fafc26080a4534e9d1d82ffbd6a7f6766b))
* **mercadopago:** use MERCADOPAGO_* naming to match AWS Parameter Store ([#179](https://github.com/cuencadelplata/ticketeate/issues/179)) ([217497e](https://github.com/cuencadelplata/ticketeate/commit/217497e6c2bf82a68cc0db80089cf40827db0c45))
* **mercadopago:** use MERCADOPAGO_* naming to match AWS Parameter Store ([8391b52](https://github.com/cuencadelplata/ticketeate/commit/8391b521d617450581df4dfbabaf85b76648b5a5))


### Features

* add camera QR scanning to scanner page ([28d97ce](https://github.com/cuencadelplata/ticketeate/commit/28d97ce5d5dda9b28e30feddd8a730fc77211a0a))
* **mercadopago:** implement OAuth 2.0 with PKCE, token refresh, and comprehensive documentation ([0edec7d](https://github.com/cuencadelplata/ticketeate/commit/0edec7db2ad84a53d83b4bd2403cc0f59486ece3))

# [1.5.0](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.4.3...svc-events-v1.5.0) (2025-11-16)


### Bug Fixes

* **mercado-pago:** add environment variables to runner stage for runtime access ([7fe975b](https://github.com/cuencadelplata/ticketeate/commit/7fe975b940d83c48df2fcb9d0a2fe18ebfc0e0fb))
* **mercadopago:** use MERCADOPAGO_ env var names to match parameter store ([7fd3708](https://github.com/cuencadelplata/ticketeate/commit/7fd37088fc111b9b7b239c5b1a06cd0e8f595c01))


### Features

* **deployment:** pass mercado pago variables as docker build args ([3e58219](https://github.com/cuencadelplata/ticketeate/commit/3e582191ea15605b8d79b19402ac7d2f845a1121))

## [1.4.3](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.4.2...svc-events-v1.4.3) (2025-11-16)


### Bug Fixes

* ensure Authorization header is correctly passed to fetch requests ([59431b3](https://github.com/cuencadelplata/ticketeate/commit/59431b3486289af6b25c2ee346406f6915934613))
* ensure Authorization header is correctly passed to fetch requests ([#166](https://github.com/cuencadelplata/ticketeate/issues/166)) ([08e7077](https://github.com/cuencadelplata/ticketeate/commit/08e70776e75bdf2e2f4a2dcad851735d903755ca))

## [1.4.2](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.4.1...svc-events-v1.4.2) (2025-11-16)


### Bug Fixes

* add /api/wallet routes to API Gateway for svc-users ([08b1e44](https://github.com/cuencadelplata/ticketeate/commit/08b1e44ddfb742f6e04b4440aa1bf92dfe918d8c))
* add /api/wallet routes to API Gateway for svc-users ([#159](https://github.com/cuencadelplata/ticketeate/issues/159)) ([4a1fa38](https://github.com/cuencadelplata/ticketeate/commit/4a1fa38daae866facd2a2f40ff4874fd9b0ece8e))
* add CORS headers to all error responses ([ee0eef0](https://github.com/cuencadelplata/ticketeate/commit/ee0eef037a8dbc79c4b6fbb2e724dba5fd7dd086))
* add CORS headers to all error responses ([#155](https://github.com/cuencadelplata/ticketeate/issues/155)) ([66d3b5b](https://github.com/cuencadelplata/ticketeate/commit/66d3b5b3fa6ea600ab208a01f4038fa46156eb70))
* add exact routes to API Gateway for /api/events, /api/users, etc ([77976ea](https://github.com/cuencadelplata/ticketeate/commit/77976eacf9a2cbe9311d751b77503d1dd093244a))
* add exact routes to API Gateway for /api/events, /api/users, etc ([#157](https://github.com/cuencadelplata/ticketeate/issues/157)) ([41f01ef](https://github.com/cuencadelplata/ticketeate/commit/41f01ef6e13801a8d4208a8d7a70c04b65a7e0fe))
* apply jwtMiddleware to both api and production paths ([aa9c889](https://github.com/cuencadelplata/ticketeate/commit/aa9c8892245f9ea066409a9674632db1e6c104a0))
* apply jwtMiddleware to both api and production paths ([#163](https://github.com/cuencadelplata/ticketeate/issues/163)) ([313f414](https://github.com/cuencadelplata/ticketeate/commit/313f414f28fa110dc14d6233cffa793231848f49))
* cast JWT payload to Record string unknown to satisfy TypeScript ([9e7a360](https://github.com/cuencadelplata/ticketeate/commit/9e7a360eabf26fe06746836f0ba8ba37f3e4a2e9))
* enable strict:false in Hono to handle routes with/without traili… ([#156](https://github.com/cuencadelplata/ticketeate/issues/156)) ([ed3f52d](https://github.com/cuencadelplata/ticketeate/commit/ed3f52d2f98265ade96243b5f41f85f552dda2ac))
* enable strict:false in Hono to handle routes with/without trailing slash ([5c278a1](https://github.com/cuencadelplata/ticketeate/commit/5c278a1524c0c823830a569f17953601eec6f0fa))
* explicit OPTIONS handler with CORS headers and 200 status ([b0809e8](https://github.com/cuencadelplata/ticketeate/commit/b0809e8e92992c2a42c22e465bc68809ca8dd8bc))
* explicit OPTIONS handler with CORS headers and 200 status ([#158](https://github.com/cuencadelplata/ticketeate/issues/158)) ([ac264d1](https://github.com/cuencadelplata/ticketeate/commit/ac264d18038632d825cbc9318fca8160d4ec83a2))
* remove /production from custom domain URL ([7d3e808](https://github.com/cuencadelplata/ticketeate/commit/7d3e808e23177fc7fe64752c06ff25e98db0881c))
* remove /production from custom domain URL ([#152](https://github.com/cuencadelplata/ticketeate/issues/152)) ([afc1854](https://github.com/cuencadelplata/ticketeate/commit/afc1854429e52c48da0e06c65faf2e0931daeae1))
* skip OPTIONS requests in auth middleware for CORS preflight ([d04ca32](https://github.com/cuencadelplata/ticketeate/commit/d04ca324e59bf43449fc52dc5f9f2460780b4462))
* standardize JWT issuer/audience to https://ticketeate.com.ar in production ([98473e2](https://github.com/cuencadelplata/ticketeate/commit/98473e29f94e439ca85e67de46fdbb3474d8d0f2))
* support custom domain routes in Lambda auth middleware ([49c2f74](https://github.com/cuencadelplata/ticketeate/commit/49c2f74c96e3cca2082a0b8a1716290b5e24f7cc))
* support custom domain routes in Lambda auth middleware ([#153](https://github.com/cuencadelplata/ticketeate/issues/153)) ([bd130be](https://github.com/cuencadelplata/ticketeate/commit/bd130be0eaa4c52bccb8e402b8262ceebb232076))
* update CORS headers and GitHub Actions IPs ([75f052f](https://github.com/cuencadelplata/ticketeate/commit/75f052f370619d7b02c932c365c1235db3e950ec))
* update CORS headers and GitHub Actions IPs ([#150](https://github.com/cuencadelplata/ticketeate/issues/150)) ([5eb7c1f](https://github.com/cuencadelplata/ticketeate/commit/5eb7c1f06b6afaba734b1427d613413c5c6ba0e9))

## [1.4.1](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.4.0...svc-events-v1.4.1) (2025-11-16)


### Bug Fixes

* update nextjs-2 EC2 IP address ([#146](https://github.com/cuencadelplata/ticketeate/issues/146)) ([9ef7169](https://github.com/cuencadelplata/ticketeate/commit/9ef716959ca2d4de5943df0939b26e29dca1141f))
* update nextjs-2 EC2 IP address to 18.217.216.210 ([c082fe9](https://github.com/cuencadelplata/ticketeate/commit/c082fe9ba65e16c4f3aeed5b3aab75710d053da8))

# [1.4.0](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.3.6...svc-events-v1.4.0) (2025-11-15)


### Features

* **svc-users:** mp oauth link ([#135](https://github.com/cuencadelplata/ticketeate/issues/135)) ([8ece996](https://github.com/cuencadelplata/ticketeate/commit/8ece99694e3a334c64e45d1491b5806a34bad0dd))
* **svc-users:** mp oauth link ([ef83ec4](https://github.com/cuencadelplata/ticketeate/commit/ef83ec47af7aecbf16931839ab3af894aced4821))

## [1.3.6](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.3.5...svc-events-v1.3.6) (2025-11-14)


### Bug Fixes

* Add type casting to response object ([d33822d](https://github.com/cuencadelplata/ticketeate/commit/d33822de6aeb8bd141cc328d164cde4afbbb2532))
* Simplify CORS - remove post-middleware, rely on Hono CORS middleware credentials: true ([4ebfb9b](https://github.com/cuencadelplata/ticketeate/commit/4ebfb9bb6db0cbda029b835d03b6a6042bf95b47))
* Use lowercase headers in lambda handler for API Gateway v2 compatibility ([e1070b9](https://github.com/cuencadelplata/ticketeate/commit/e1070b99324fa3408b979e52dba4e80a49dcc2aa))

## [1.3.5](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.3.4...svc-events-v1.3.5) (2025-11-14)


### Bug Fixes

* Add explicit middleware to ensure Access-Control-Allow-Credentials header is always set ([b2272ff](https://github.com/cuencadelplata/ticketeate/commit/b2272ff59aa7bdf265d291908124cf2630013f87))
* Make middleware properly async and await next() ([b0acb3e](https://github.com/cuencadelplata/ticketeate/commit/b0acb3ebc1d5195240072b119c8598143e3344e5))
* Mount routes at both /api and /production/api to handle API Gateway stage prefix ([8420575](https://github.com/cuencadelplata/ticketeate/commit/8420575eac42188b80f95c1b143d252d47bee3d4))
* Move CORS middleware before stage prefix stripping ([df20879](https://github.com/cuencadelplata/ticketeate/commit/df208793cc8ab0c9c09ba965f276bf1b4d90305b))
* Move credentials header logic to Lambda handler wrapper for better control ([4efd3b1](https://github.com/cuencadelplata/ticketeate/commit/4efd3b1e16676c4f6a86b0fb05a6a6cc89e83863))
* Rename handler variable to avoid redeclaration ([80f283d](https://github.com/cuencadelplata/ticketeate/commit/80f283df7b70ea7529f93a5e52d87ed8d7aaff03))
* Simplify CORS with hardcoded origins to eliminate undefined values ([86b521e](https://github.com/cuencadelplata/ticketeate/commit/86b521eb9c553e12f65b94789f4a03161f0fe100))
* Strip API Gateway stage prefix from request path ([6a864b4](https://github.com/cuencadelplata/ticketeate/commit/6a864b435fc420b5ea4bd3180873fa1dbdfa8b75))
* Use AWS Lambda base image for all Lambda services ([a56982d](https://github.com/cuencadelplata/ticketeate/commit/a56982d7adc99245fe86400a9d7d7255e1d409ac))

## [1.3.4](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.3.3...svc-events-v1.3.4) (2025-11-14)


### Bug Fixes

* Remove node_modules copy from builder to prevent broken workspace symlinks ([48fea4e](https://github.com/cuencadelplata/ticketeate/commit/48fea4eb4586c4df92e688268394ffebba39b51e))

## [1.3.3](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.3.2...svc-events-v1.3.3) (2025-11-14)


### Bug Fixes

* Source .env.production before updating Lambda environment variables ([ba433de](https://github.com/cuencadelplata/ticketeate/commit/ba433de94218d76e1d0d33827da837965aa4e0b6))
* Use echo method instead of heredoc to avoid YAML parsing issues ([a8586ab](https://github.com/cuencadelplata/ticketeate/commit/a8586abe2880e99d4af0f5e0e012073819784ce0))
* Use jq to build Lambda env vars directly from params JSON ([77319d3](https://github.com/cuencadelplata/ticketeate/commit/77319d379d6e0bd3f5e0b78afc9e7e14af8d9f07))
* Use lambda.js handler in all Lambda Dockerfiles instead of index.js ([e0b0cf2](https://github.com/cuencadelplata/ticketeate/commit/e0b0cf2adabf1181930fbef62b8182a8ec0a3a4d))
* Use proper bash quote concatenation for Parameters string ([9ffeae9](https://github.com/cuencadelplata/ticketeate/commit/9ffeae93e6c47bbf33609dd002832fff5e665ab7))

## [1.3.2](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.3.1...svc-events-v1.3.2) (2025-11-14)


### Bug Fixes

* Convert newlines to spaces in jq parameter processing ([62f01a5](https://github.com/cuencadelplata/ticketeate/commit/62f01a54b9c383f02cec24963ccb5a1a4710f36e))
* Robust newline handling in parameter processing with tr and printf ([c0b1836](https://github.com/cuencadelplata/ticketeate/commit/c0b1836c079ea87b29ecf21589f7f4b7e6ac8c65))
* Use base64 encoding to safely handle parameter values with special characters ([ae8d821](https://github.com/cuencadelplata/ticketeate/commit/ae8d821521fedd127a2dd3b20836752f84253d6f))
* Use Python for robust parameter processing - handles multiline values correctly ([e3c5f8e](https://github.com/cuencadelplata/ticketeate/commit/e3c5f8e7258827bd998b628019a531cf89773d52))
* Use Python one-liner to avoid bash source issues with special characters ([b0c74f3](https://github.com/cuencadelplata/ticketeate/commit/b0c74f34bd3f6e54505a7953f2a7050b398b70e1))

## [1.3.1](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.3.0...svc-events-v1.3.1) (2025-11-14)


### Bug Fixes

* Preserve hyphens in parameter values during env var transformation ([3010c32](https://github.com/cuencadelplata/ticketeate/commit/3010c32dbc9719d4eab540e801eff77c6e00314a))
* Use jq instead of awk to handle multiline Parameter Store values ([2c9c934](https://github.com/cuencadelplata/ticketeate/commit/2c9c934855d6d84ecd2faecc67ea74efda85e6df))

# [1.3.0](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.2.0...svc-events-v1.3.0) (2025-11-14)


### Bug Fixes

* Generate Prisma client in all Docker production stages (Next.js and Lambdas) ([c54377d](https://github.com/cuencadelplata/ticketeate/commit/c54377dcff5abf0bfa9181aa5e4b76f50171106a))
* Install all deps before Prisma generation, then reinstall prod only ([0066c85](https://github.com/cuencadelplata/ticketeate/commit/0066c858f7313b2dd258099c97817275b78d8efb))
* Suppress Lambda update output to prevent key exposure ([5e773ed](https://github.com/cuencadelplata/ticketeate/commit/5e773ed3573d4978a21d02495e2df79c45fc97fc))
* Use JSON file for Lambda env vars & mask sensitive values in logs ([5b9d353](https://github.com/cuencadelplata/ticketeate/commit/5b9d353dd697ece52ec77edbc1be61319f42c42a))


### Features

* Update Lambda environment variables during deployment ([8527bf9](https://github.com/cuencadelplata/ticketeate/commit/8527bf90ee84c07dcc53cac7042414f5b8798ae4))

# [1.2.0](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.1.4...svc-events-v1.2.0) (2025-11-14)


### Bug Fixes

* Generate Prisma client in production Docker stage ([f6abefb](https://github.com/cuencadelplata/ticketeate/commit/f6abefb7facd93356f6aa75814b6531115daa662))
* inject production env vars into Next.js build and runtime ([59be1f6](https://github.com/cuencadelplata/ticketeate/commit/59be1f6b0f213cdd9252c70aa0208ea9eee59eff))
* mejorar debugging en workflow de nginx deployment ([1ddbc15](https://github.com/cuencadelplata/ticketeate/commit/1ddbc15c3b8f26940ee5436fdb09b309a43ed13f))
* mejorar debugging en workflow de nginx deployment ([#126](https://github.com/cuencadelplata/ticketeate/issues/126)) ([9159f87](https://github.com/cuencadelplata/ticketeate/commit/9159f877853fad33f7b35807ef93c02be6f82930))
* Remove SSL configuration temporarily to fix nginx startup ([6b87d17](https://github.com/cuencadelplata/ticketeate/commit/6b87d17818b05d3fcccc016d8c52e7f9900364ca))
* Remove SSL configuration temporarily to fix nginx startup ([#129](https://github.com/cuencadelplata/ticketeate/issues/129)) ([c45b958](https://github.com/cuencadelplata/ticketeate/commit/c45b958a46492bed3f4716826ae54b811450d6af))
* SSM ([a5b2b96](https://github.com/cuencadelplata/ticketeate/commit/a5b2b96f50616297c8068b81939da8f5392fc341))
* SSM ([#128](https://github.com/cuencadelplata/ticketeate/issues/128)) ([926ad90](https://github.com/cuencadelplata/ticketeate/commit/926ad907b15f0a8a8459959f2b4f048f607db40d))
* usar SSM en lugar de SSH para deployment desde GitHub Actions ([c094e52](https://github.com/cuencadelplata/ticketeate/commit/c094e52afea19c62bbbc023ce75f5e7256549ba6))
* usar SSM en lugar de SSH para deployment desde GitHub Actions ([#127](https://github.com/cuencadelplata/ticketeate/issues/127)) ([a681795](https://github.com/cuencadelplata/ticketeate/commit/a6817950e3e8a6455838a1da17459a85b6cf5ab5))


### Features

* deploy nginx con hybrid.conf ([97d2fdb](https://github.com/cuencadelplata/ticketeate/commit/97d2fdbd446936a3e5af357c5ab3903623abab6c))
* deploy nginx con hybrid.conf ([#125](https://github.com/cuencadelplata/ticketeate/issues/125)) ([09fc126](https://github.com/cuencadelplata/ticketeate/commit/09fc12610c6628f50e2d9e5b1e9e1f0dd2c6884d))
* use environment variables for CORS and JWT configuration in microservices ([80d380e](https://github.com/cuencadelplata/ticketeate/commit/80d380eaa908bc6b5667fb63140eb85025aa0b3e))

## [1.1.4](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.1.3...svc-events-v1.1.4) (2025-11-13)


### Bug Fixes

* **web:** main container - responsive menu ([#116](https://github.com/cuencadelplata/ticketeate/issues/116)) ([b4f5e86](https://github.com/cuencadelplata/ticketeate/commit/b4f5e86897e4f11a9eb79215f0f29f238dba47cc))
* **hero:** main container ([ddb594c](https://github.com/cuencadelplata/ticketeate/commit/ddb594c4989e4c7b83d9cc005fb672196537a876))
* workflows ([3ff0ddf](https://github.com/cuencadelplata/ticketeate/commit/3ff0ddf8d9cddbcf832d0aab8f8c2856c9ac8fbc))
* workflows ([#113](https://github.com/cuencadelplata/ticketeate/issues/113)) ([3d20386](https://github.com/cuencadelplata/ticketeate/commit/3d203866bcf4d90303ed212eb2bdb2740eb185ec))

## [1.1.3](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.1.2...svc-events-v1.1.3) (2025-11-05)


### Bug Fixes

* **docker:** correct next-frontend package name filter in build ([#106](https://github.com/cuencadelplata/ticketeate/issues/106)) ([3f00d83](https://github.com/cuencadelplata/ticketeate/commit/3f00d8330e183ccdcbd5fceb1b3dce445043e7ef))
* **docker:** correct next-frontend package name filter in build ([ee4cfda](https://github.com/cuencadelplata/ticketeate/commit/ee4cfda8c0ab0ea55bd515fbb8e0ff862bb7dd4d))

## [1.1.2](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.1.1...svc-events-v1.1.2) (2025-11-03)


### Bug Fixes

* deploy ecr ([be99448](https://github.com/cuencadelplata/ticketeate/commit/be99448f1ce03789de5f3538a0fb4a2f01e2fca2))
* deploy ecr ([ef8c15b](https://github.com/cuencadelplata/ticketeate/commit/ef8c15bb0e156e7b3c4748eed562a224e3f582f6))
* deploy ecr ([#102](https://github.com/cuencadelplata/ticketeate/issues/102)) ([154d8a0](https://github.com/cuencadelplata/ticketeate/commit/154d8a0e5002743e1d12c84b16723d1242bdef18))
* deploy ecr ([#103](https://github.com/cuencadelplata/ticketeate/issues/103)) ([0c2d93a](https://github.com/cuencadelplata/ticketeate/commit/0c2d93a327cd9dc9ea1588391203711e28335050))
* **tsconfig:** enable emit for all services to produce dist in Docker builds ([ceb598d](https://github.com/cuencadelplata/ticketeate/commit/ceb598da68e9d1345f45bc8b62cde35295ccdfcd))
* **tsconfig:** enable emit for svc-users build ([#104](https://github.com/cuencadelplata/ticketeate/issues/104)) ([9bbe842](https://github.com/cuencadelplata/ticketeate/commit/9bbe8425b71905dd8665c090e77608bf8d5e8031))
* **tsconfig:** enable emit for svc-users build to produce dist in Docker builds ([5e08686](https://github.com/cuencadelplata/ticketeate/commit/5e086867404f97cf148b2452301bd58308f76e40))
* **docker:** include eslint-config and typescript-config packages in … ([#101](https://github.com/cuencadelplata/ticketeate/issues/101)) ([fe3b3b4](https://github.com/cuencadelplata/ticketeate/commit/fe3b3b41671e6e6255879c7712d1768164278b59))
* **docker:** include eslint-config and typescript-config packages in Docker builds ([d1ac621](https://github.com/cuencadelplata/ticketeate/commit/d1ac62120fe9e43f0e951fc4b8c6d3b21ba76b80))

## [1.1.1](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.1.0...svc-events-v1.1.1) (2025-11-03)


### Bug Fixes

* **docker:** use --no-frozen-lockfile in service Dockerfiles to preve… ([#100](https://github.com/cuencadelplata/ticketeate/issues/100)) ([27c3058](https://github.com/cuencadelplata/ticketeate/commit/27c3058542e8348f25378a781df4d7ae944e3439))
* **docker:** use --no-frozen-lockfile in service Dockerfiles to prevent CI conflicts ([01be6c2](https://github.com/cuencadelplata/ticketeate/commit/01be6c2d5d1745c3d5f5417f51fd0d4c47e15b62))

# [1.1.0](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.0.1...svc-events-v1.1.0) (2025-11-03)


### Features

* **svc-events:** test release workflow with version bump ([#98](https://github.com/cuencadelplata/ticketeate/issues/98)) ([bab7624](https://github.com/cuencadelplata/ticketeate/commit/bab76244920468490e2325016bb42b7e9d6b1cab))
* **svc-events:** test release workflow with version bump ([4112dcb](https://github.com/cuencadelplata/ticketeate/commit/4112dcb64b164a195ee7704a25d8fd634645ae97))

## [1.0.1](https://github.com/cuencadelplata/ticketeate/compare/svc-events-v1.0.0...svc-events-v1.0.1) (2025-11-03)


### Bug Fixes

* add semantic-release dependencies to svc-users to sync lockfile ([7d4a250](https://github.com/cuencadelplata/ticketeate/commit/7d4a2503516333aac0b09722476df01b03fd9172))
* **next-frontend:** auth - middleware - otp email ([#94](https://github.com/cuencadelplata/ticketeate/issues/94)) ([e6f6ea7](https://github.com/cuencadelplata/ticketeate/commit/e6f6ea72b378ff0c54a5bf24e012951846f6a7ad))
* **next-frontend:** auth - middleware - otp email ([f360028](https://github.com/cuencadelplata/ticketeate/commit/f3600289958a49d08767ceb6c4a716f6b29b85c9))
* **next-frontend:** auth - middleware - otp email ([925534a](https://github.com/cuencadelplata/ticketeate/commit/925534ae8a1e0250d778d00abf70fbc8b0a808aa))
* queues - rsc - profile config ([#96](https://github.com/cuencadelplata/ticketeate/issues/96)) ([dc0d3ed](https://github.com/cuencadelplata/ticketeate/commit/dc0d3edb9a306d8428ecad7d009315e262b98172))
* reset password ([0c0a262](https://github.com/cuencadelplata/ticketeate/commit/0c0a262907ed803560e917ded3a68196a21e5a57))
* tsconfig - import google fonts ([0572c6f](https://github.com/cuencadelplata/ticketeate/commit/0572c6f681bf28bc558c451ccea3edda1723a5dd))
* workflows aws ecr ([f8885c0](https://github.com/cuencadelplata/ticketeate/commit/f8885c083e5bfcd45bc81fd11858dd4d1cb82dd9))

# 1.0.0 (2025-11-01)


### Bug Fixes

* **panel:** admin panel colors ([#91](https://github.com/cuencadelplata/ticketeate/issues/91)) ([50050a7](https://github.com/cuencadelplata/ticketeate/commit/50050a7cbfc6da5593fa7fc4759356dab6a3460b))
* **panel:** admin panel colors ([8308329](https://github.com/cuencadelplata/ticketeate/commit/830832950e770beb45af08e2b929b68943a60ee4))
* **panel:** admin panel colors ([1889db2](https://github.com/cuencadelplata/ticketeate/commit/1889db206254f7a4b446e95705883edb6d2b82e7))
* **panel:** admin panel colors ([1d54d37](https://github.com/cuencadelplata/ticketeate/commit/1d54d373f6cde1179216e4f521031eeacc06f19f))
* **panel:** admin panel colors ([8941f90](https://github.com/cuencadelplata/ticketeate/commit/8941f907ac410d3d6169e8f843cd8342ce2a0784))
* **panel:** admin panel colors ([ca916a9](https://github.com/cuencadelplata/ticketeate/commit/ca916a98829bd8bce10bc1a4d06357bd8c5bea45))
* agregar dependencia cloudinary ([2443161](https://github.com/cuencadelplata/ticketeate/commit/244316139ef3ef315898a5bbef0ceadc309b138d))
* agregar dotenv a dependencias y remover CMD duplicado ([428d060](https://github.com/cuencadelplata/ticketeate/commit/428d0603bebb73605f455817b19f4d9cb5ebfbdd))
* agregar env vars dummy para build de next.js ([e925390](https://github.com/cuencadelplata/ticketeate/commit/e925390bab0da4e112caa5cf6b784b885e6d247e))
* agregar env vars dummy para build de next.js ([#74](https://github.com/cuencadelplata/ticketeate/issues/74)) ([84148ae](https://github.com/cuencadelplata/ticketeate/commit/84148ae4731622bfe46a8df4a86565d9fb86e64c))
* agregar paso de generacion de prisma client en dockerfile ([b281809](https://github.com/cuencadelplata/ticketeate/commit/b281809cfc44f0f0697a36c61a640877a5794557))
* agregar paso de generacion de prisma client en dockerfile ([a2b3768](https://github.com/cuencadelplata/ticketeate/commit/a2b3768e6f34e6216c435d249f39620bb55e651f))
* agregar RESEND_API_KEY dummy ([f812cbd](https://github.com/cuencadelplata/ticketeate/commit/f812cbd8ce5a58f40cacd5265932252ec9cee1a8))
* agregar RESEND_API_KEY dummy ([#75](https://github.com/cuencadelplata/ticketeate/issues/75)) ([24db48c](https://github.com/cuencadelplata/ticketeate/commit/24db48c0ab69b9054a1b400ca168faab083ef582))
* auth - middleware - otp email ([1da6520](https://github.com/cuencadelplata/ticketeate/commit/1da6520e18a4311ca50f3748ffc3a1bca59360d6))
* auth - middleware - otp email ([#93](https://github.com/cuencadelplata/ticketeate/issues/93)) ([91e52f2](https://github.com/cuencadelplata/ticketeate/commit/91e52f2d721ec1eeb0748279486bd06782531bd7))
* brand assets - logo ([2219630](https://github.com/cuencadelplata/ticketeate/commit/2219630239bb36d66fe83aa99ba179c5b4078347))
* capacity modal bug ([baeb8fe](https://github.com/cuencadelplata/ticketeate/commit/baeb8fe6539cebe71b1d3647b46419879e10057b))
* capacity modal bug ([#45](https://github.com/cuencadelplata/ticketeate/issues/45)) ([81b81ce](https://github.com/cuencadelplata/ticketeate/commit/81b81ce18301823f61b740e213c859f32db26e61))
* cicd panel merge ([6814a73](https://github.com/cuencadelplata/ticketeate/commit/6814a73cebbedfe6397bb24d0a469d29bdc8c60f))
* cicd panel merge ([#2](https://github.com/cuencadelplata/ticketeate/issues/2)) ([e917d45](https://github.com/cuencadelplata/ticketeate/commit/e917d45c8c5dd085c66eeef82e3cfd519a07613e))
* cooldown resend email ([b61fa56](https://github.com/cuencadelplata/ticketeate/commit/b61fa5640c821efc9385ac0bc8a7a336b0c95e08))
* corrección de CORS y detección dinámica de URLs para red local ([07a2a3d](https://github.com/cuencadelplata/ticketeate/commit/07a2a3d0c571dd6fec723bd4fd0116dca2a3796e))
* corrección de CORS y detección dinámica de URLs para red local ([#54](https://github.com/cuencadelplata/ticketeate/issues/54)) ([04010a7](https://github.com/cuencadelplata/ticketeate/commit/04010a7cfebe5598bd8deb455e1de5d7252df596))
* **ci:** corregir detección de commits con scope en release workflow ([#92](https://github.com/cuencadelplata/ticketeate/issues/92)) ([89a8682](https://github.com/cuencadelplata/ticketeate/commit/89a868201efdd7d8c5ec32cb5a61716ff8bb9fd3))
* **ci:** corregir detección de commits con scope en release workflow ([1e6baaa](https://github.com/cuencadelplata/ticketeate/commit/1e6baaa32d8f845504f04b2a7cafaa5f4a5057cd))
* description input ([f0c505a](https://github.com/cuencadelplata/ticketeate/commit/f0c505aec067eb0bd43ef4cc1dadfc3ba1635d4c))
* description input ([f16985f](https://github.com/cuencadelplata/ticketeate/commit/f16985fdb49157f29207fa69aa531691b65c5e6a))
* footer ([2d57251](https://github.com/cuencadelplata/ticketeate/commit/2d572515149a93c6e8244dc94b13b72f5568e710))
* footer ([#44](https://github.com/cuencadelplata/ticketeate/issues/44)) ([c40e15d](https://github.com/cuencadelplata/ticketeate/commit/c40e15db39983371094e627e1cce9a1ab71f8a4b))
* form event visibility ([f28b36c](https://github.com/cuencadelplata/ticketeate/commit/f28b36c7a1e31a44c269d206179eec3797c72c62))
* format ([68b8006](https://github.com/cuencadelplata/ticketeate/commit/68b800688e9d54aa7f50b1c679f792571a502fe9))
* **ci:** github bot ([#87](https://github.com/cuencadelplata/ticketeate/issues/87)) ([a0bc70b](https://github.com/cuencadelplata/ticketeate/commit/a0bc70beb550c144ee6f08b62b7c29d33390c8ef))
* **ci:** github bot ([498a203](https://github.com/cuencadelplata/ticketeate/commit/498a203e4631260fa9c314d71fe042b91b95e25d))
* github checklist ([772cc95](https://github.com/cuencadelplata/ticketeate/commit/772cc95d8077c92be5a9afb511264e7f37ee0a18))
* github pr ([b0afbb1](https://github.com/cuencadelplata/ticketeate/commit/b0afbb158b39ec2d9771e1f9abb1765e98b8ce00))
* github pr ([#14](https://github.com/cuencadelplata/ticketeate/issues/14)) ([6dd09f6](https://github.com/cuencadelplata/ticketeate/commit/6dd09f6fd5233c384fa5546b352556841880532a))
* integrate next-frontend as regular directory instead of submodule ([53908dd](https://github.com/cuencadelplata/ticketeate/commit/53908ddd6d6154d4c035f27c6f2c502137e96222))
* integrate next-frontend as regular directory instead of submodule ([655f8f7](https://github.com/cuencadelplata/ticketeate/commit/655f8f74d18682a7bb5ff041c39f60c9de7f6958))
* integrate next-frontend as regular directory instead of submodule ([376fe1f](https://github.com/cuencadelplata/ticketeate/commit/376fe1f890e4bf78ddb6d6022f422e12045c3a0e))
* integrate next-frontend as regular directory instead of submodule ([977d934](https://github.com/cuencadelplata/ticketeate/commit/977d93476a2bd64df5b6b55d5993b8cf14568fe8))
* integrate next-frontend as regular directory instead of submodule ([b119e7c](https://github.com/cuencadelplata/ticketeate/commit/b119e7ceb6956ee8b7faec644f04b12b94f55028))
* integrate next-frontend as regular directory instead of submodule ([f6c3b2c](https://github.com/cuencadelplata/ticketeate/commit/f6c3b2c847fccb95868c929219b8f19d7dab675e))
* integrate next-frontend as regular directory instead of submodule ([003a156](https://github.com/cuencadelplata/ticketeate/commit/003a15684dc138df15cfaae31e5ca26625a40996))
* integrate next-frontend as regular directory instead of submodule ([63ac0f4](https://github.com/cuencadelplata/ticketeate/commit/63ac0f480e9543a2af48add2b6682752c430f63c))
* integrate next-frontend as regular directory instead of submodule ([4049471](https://github.com/cuencadelplata/ticketeate/commit/4049471e74b47d09910dcde27ae5848561438b03))
* integrate next-frontend as regular directory instead of submodule ([8410ebb](https://github.com/cuencadelplata/ticketeate/commit/8410ebb527a421bd705c3f191b51cef7be2e80ca))
* integrate next-frontend as regular directory instead of submodule ([#4](https://github.com/cuencadelplata/ticketeate/issues/4)) ([00ecede](https://github.com/cuencadelplata/ticketeate/commit/00eceded1bac96f35336ea80e190d474f6dc1aeb))
* integrate next-frontend as regular directory instead of submodule ([#5](https://github.com/cuencadelplata/ticketeate/issues/5)) ([5876df2](https://github.com/cuencadelplata/ticketeate/commit/5876df2d5446a0a2a8d8274d8164103b0859a510))
* linters ([b238d76](https://github.com/cuencadelplata/ticketeate/commit/b238d76fcfadff672a5004c1e7cab190592d9d45))
* linters ([ba592c0](https://github.com/cuencadelplata/ticketeate/commit/ba592c0840b40757a5d91ce6b099d846af766c3f))
* linters ([7ae7bcf](https://github.com/cuencadelplata/ticketeate/commit/7ae7bcf049d1407efbf4b231162179a94e68c443))
* mover script de tagging a .github/scripts para que se incluya en git ([3629028](https://github.com/cuencadelplata/ticketeate/commit/36290281982aeb70b85a7e6fd39408e1b7d0c334))
* mover script de tagging a .github/scripts para que se incluya en git ([4f0432a](https://github.com/cuencadelplata/ticketeate/commit/4f0432aa739e68cf50dab00e88cda720af0eda52))
* **next-frontend/api:** normalizar respuestas de eventos (fechas ISO) y calcular disponibilidad; limpiar warnings ESLint ([1fe2173](https://github.com/cuencadelplata/ticketeate/commit/1fe21739db2c8e22a296e0f0b082fb69828e20a9))
* pr checklist ([f568bea](https://github.com/cuencadelplata/ticketeate/commit/f568bea7992b3702fccff9c0fa547e352152fa56))
* pr checklist ([456317d](https://github.com/cuencadelplata/ticketeate/commit/456317d67e1a0942d5664288803338c0352a70a8))
* pr checklist ([6da0682](https://github.com/cuencadelplata/ticketeate/commit/6da0682af5cc8dd66c4be102455a22d0564bd37f))
* pr checklist ([a1851be](https://github.com/cuencadelplata/ticketeate/commit/a1851be788fe87b168c5a7a7b16c0f53f1df0a96))
* pr checklist ([#19](https://github.com/cuencadelplata/ticketeate/issues/19)) ([8de366e](https://github.com/cuencadelplata/ticketeate/commit/8de366e81239efb309f2d456095d916f7dcca67b))
* pr template ([9063d46](https://github.com/cuencadelplata/ticketeate/commit/9063d4607fff004339aceb2183fd1e97f68f30f7))
* prettier format style ([bf1bae1](https://github.com/cuencadelplata/ticketeate/commit/bf1bae10759efb0240c493f0cc061167b07aeb58))
* readme docs ([1babcae](https://github.com/cuencadelplata/ticketeate/commit/1babcae50c49f32ffdca47f9578399f2ba5e696b))
* readme docs ([6c7494e](https://github.com/cuencadelplata/ticketeate/commit/6c7494e12152c0aa246181b6dc0f1700c755be4c))
* readme docs ([aa5393e](https://github.com/cuencadelplata/ticketeate/commit/aa5393ef8115cc9257c9a23c4fd6c8d2c06e942a))
* readme docs ([#10](https://github.com/cuencadelplata/ticketeate/issues/10)) ([1c535d4](https://github.com/cuencadelplata/ticketeate/commit/1c535d4147b2bd7a6735604f11f26b6546d2ba20))
* readme docs ([#6](https://github.com/cuencadelplata/ticketeate/issues/6)) ([fa60c9d](https://github.com/cuencadelplata/ticketeate/commit/fa60c9defcab80309ef8ccc3cfe506419ccd697e))
* readme prettier format ([e69ff95](https://github.com/cuencadelplata/ticketeate/commit/e69ff9598667d6a262e21527687d3971b40fda57))
* remove git commit step from semantic-release to bypass branch protection ([f333acb](https://github.com/cuencadelplata/ticketeate/commit/f333acbae761a032c9fbdd84dd7374f7894b555c))
* remove git commit step from semantic-release to bypass branch protection ([100f827](https://github.com/cuencadelplata/ticketeate/commit/100f827b0798194041e469c675d0295685fab480))
* remove non-existent prisma directory copy and duplicate CMD ([887ac2c](https://github.com/cuencadelplata/ticketeate/commit/887ac2c3063a9ba12e7788f00acf69c344306641))
* remove non-existent prisma directory copy and duplicate CMD ([#79](https://github.com/cuencadelplata/ticketeate/issues/79)) ([4e2dccd](https://github.com/cuencadelplata/ticketeate/commit/4e2dccd16eaee8dc9ce3bea6a9518a44681fecb0))
* remover cloudinary del root package.json ([4602a2b](https://github.com/cuencadelplata/ticketeate/commit/4602a2b4ba0122f7a94d91b61546bcfb35a161a7))
* remover emojis y manejar tags inválidos automáticamente en script de tagging ([ac5451c](https://github.com/cuencadelplata/ticketeate/commit/ac5451c96a119625a4651792907dd22dcaa529a9))
* replace @semantic-release/npm with @semantic-release/exec ([#82](https://github.com/cuencadelplata/ticketeate/issues/82)) ([856ab5b](https://github.com/cuencadelplata/ticketeate/commit/856ab5b337c8cb47cb810f05fe602846b5010281))
* replace @semantic-release/npm with @semantic-release/exec for pnpm workspace compatibility ([fd4da47](https://github.com/cuencadelplata/ticketeate/commit/fd4da4769faaaed1e807d191bcd09ee454a513d4))
* replace @semantic-release/npm with @semantic-release/exec for pnpm workspace compatibility ([9ebc245](https://github.com/cuencadelplata/ticketeate/commit/9ebc245e66460b3577660ad5e4ff52e021527ccf))
* resolve merge conflict in ComprarPage ([80f0f16](https://github.com/cuencadelplata/ticketeate/commit/80f0f165bc01861d2364e7e61a77e75dd8785849))
* resolve merge conflict in configuracion page ([253bbea](https://github.com/cuencadelplata/ticketeate/commit/253bbeaa98f8b52c9d2e74497e6d52ddd27cd9b6))
* **svc-events:** resolve TypeScript compilation errors in test files ([#85](https://github.com/cuencadelplata/ticketeate/issues/85)) ([331c4f8](https://github.com/cuencadelplata/ticketeate/commit/331c4f8fd18badcbe513cce9c02befe2fa7f71f9))
* **svc-events:** resolve TypeScript compilation errors in test files ([9e31b0d](https://github.com/cuencadelplata/ticketeate/commit/9e31b0db324e63caadc8156acab291a6b3dbbce3))
* resolver conflicto en workflow ([3a44fa9](https://github.com/cuencadelplata/ticketeate/commit/3a44fa999f1cfa4fba270a23b6601dcc175fc376))
* unused vars ([4d1f2c9](https://github.com/cuencadelplata/ticketeate/commit/4d1f2c9f3aa61d6950e06c2d0e3b4c6755283314))
* update Node.js version to 22 for semantic-release compatibility ([36fb755](https://github.com/cuencadelplata/ticketeate/commit/36fb755b47782ae22d2257f3904318ecd130b4eb))
* update Node.js version to 22 for semantic-release compatibility ([a7f4551](https://github.com/cuencadelplata/ticketeate/commit/a7f4551e4d84286d699cb15c23db2aafec926486))
* update Node.js version to 22 for semantic-release compatibility ([#81](https://github.com/cuencadelplata/ticketeate/issues/81)) ([430b5b9](https://github.com/cuencadelplata/ticketeate/commit/430b5b91382629c83c6e4a7d67f9509790304963))
* use Node.js script to update package.json ([#83](https://github.com/cuencadelplata/ticketeate/issues/83)) ([2a82c71](https://github.com/cuencadelplata/ticketeate/commit/2a82c710a22011d356ed71919a196eb54c51b3eb))
* use Node.js script to update package.json instead of pnpm version ([823724d](https://github.com/cuencadelplata/ticketeate/commit/823724da1b585ac167e5ba8e8da8eb718d5aa497))
* workflow routes ([2782ece](https://github.com/cuencadelplata/ticketeate/commit/2782ecebf9e4c659fe13645910f0d89fd0e06031))
* workflow routes ([#18](https://github.com/cuencadelplata/ticketeate/issues/18)) ([d467a6f](https://github.com/cuencadelplata/ticketeate/commit/d467a6fe09785b4bdfe2a676961eb011c9fe7c57))
* workflows ([bdf72db](https://github.com/cuencadelplata/ticketeate/commit/bdf72db09583be0ef78a947060b7256267e05116))
* workflows ([81fbc02](https://github.com/cuencadelplata/ticketeate/commit/81fbc02a90b0dd53fdd332969fd3f565c2a58cf2))
* **ci:** workflows changelog ([#88](https://github.com/cuencadelplata/ticketeate/issues/88)) ([f6f7875](https://github.com/cuencadelplata/ticketeate/commit/f6f7875e2900ffebabf43489bbe54019c2be41a9))
* **ci:** workflows changelog ([#89](https://github.com/cuencadelplata/ticketeate/issues/89)) ([7cc7b8a](https://github.com/cuencadelplata/ticketeate/commit/7cc7b8a7de9618978ce2b499f5f81f83b29c6bc5))
* **ci:** workflows changelog ([#90](https://github.com/cuencadelplata/ticketeate/issues/90)) ([6184746](https://github.com/cuencadelplata/ticketeate/commit/6184746668bce9ff3225b66b506a04f61251dc3a))
* **ci:** workflows changelog ([b587dc8](https://github.com/cuencadelplata/ticketeate/commit/b587dc888c202c7d49561d81ac6f91de19618f84))
* **ci:** workflows changelog ([3697a82](https://github.com/cuencadelplata/ticketeate/commit/3697a82d1e7c17ba6c372e6681fbf0ca3db5c6bf))
* **ci:** workflows changelog ([0a552c8](https://github.com/cuencadelplata/ticketeate/commit/0a552c8850d8ae24c533bd1b26ab29989ff50b0e))
* **ci:** workflows changelog ([2e2e8d2](https://github.com/cuencadelplata/ticketeate/commit/2e2e8d243de12c2c2393dad5c7180d7ecb835178))
* **ci:** workflows changelog ([8734a01](https://github.com/cuencadelplata/ticketeate/commit/8734a011d02e97f1174642a6735a9f166c5fdbce))
* wrap AuthPage in Suspense for sign-in and sign-up pages ([ea322c9](https://github.com/cuencadelplata/ticketeate/commit/ea322c9d3049f539c8a24ea27d455f77c9eaa750))
* wrap AuthPage in Suspense for sign-in and sign-up pages ([67d47e5](https://github.com/cuencadelplata/ticketeate/commit/67d47e52d59f1a41d1de133706aa969dd084b406))
* wrap AuthPage in Suspense for sign-in and sign-up pages ([#78](https://github.com/cuencadelplata/ticketeate/issues/78)) ([f1eac2a](https://github.com/cuencadelplata/ticketeate/commit/f1eac2ad83dbe6bfed14fc75dee9c5150fdddcd6))
* wrap useSearchParams components in Suspense (crear, sobre-nosotros, productoras) ([605a8b4](https://github.com/cuencadelplata/ticketeate/commit/605a8b4588ea6eab0d3d5266934edd22dfd9c720))
* wrap useSearchParams components in Suspense (crear, sobre-nosotros, productoras) ([e722b59](https://github.com/cuencadelplata/ticketeate/commit/e722b590298ada2d1b927ddd798d054321dc7a07))
* wrap useSearchParams in Suspense boundary ([cf8cac2](https://github.com/cuencadelplata/ticketeate/commit/cf8cac284cc405cdd87ee67307df419ac3e621db))
* wrap useSearchParams in Suspense boundary ([333cd29](https://github.com/cuencadelplata/ticketeate/commit/333cd29d5e07507f9e6b6179f7c9e4f2c3979b7f))
* wrap useSearchParams in Suspense boundary ([#76](https://github.com/cuencadelplata/ticketeate/issues/76)) ([9e13630](https://github.com/cuencadelplata/ticketeate/commit/9e136306896fa3df934ea35dc53928bb3a0b4ca7))
* wrap useSearchParams in Suspense for configuracion page ([9a072e4](https://github.com/cuencadelplata/ticketeate/commit/9a072e48ed5adbd1e8bac32d3aece0c9c1045066))
* wrap useSearchParams in Suspense for configuracion page ([c0912a6](https://github.com/cuencadelplata/ticketeate/commit/c0912a61dbf767dc0bff35001702223442ddce74))
* wrap useSearchParams in Suspense for configuracion page ([#77](https://github.com/cuencadelplata/ticketeate/issues/77)) ([e6bee2a](https://github.com/cuencadelplata/ticketeate/commit/e6bee2acc77a10f53e71c1ee63aa8c8c19ccadf0))


### Code Refactoring

* migrate to semantic-release tagging system ([748b96d](https://github.com/cuencadelplata/ticketeate/commit/748b96d69c9c248cf59a62d57de721f06035760e))


### Features

* add automated release manager for next-frontend ([5b71697](https://github.com/cuencadelplata/ticketeate/commit/5b71697c514639df3b3e6293d8d5cdf4ba6d041a))
* agregar funciones de fetch con Prisma en apiEventos.ts ([f1ebc63](https://github.com/cuencadelplata/ticketeate/commit/f1ebc63a2ee50735e587371220bc23d8bf6006cf))
* **services:** configure semantic-release and Docker build for all microservices ([be5074f](https://github.com/cuencadelplata/ticketeate/commit/be5074f9134066e30299aadd5bcadfd9c744b267))
* definir tipos TypeScript para API de eventos ([42c36ae](https://github.com/cuencadelplata/ticketeate/commit/42c36ae4b22e9cd9c58e26c03edde0bf43988501))
* design system colors ([dcf5cc9](https://github.com/cuencadelplata/ticketeate/commit/dcf5cc921c41dcf0d4912f33a40adb0bbfaeba6f))
* design system components ([528ee03](https://github.com/cuencadelplata/ticketeate/commit/528ee03d372726fd54d6d274270f09e13bf8cd2a))
* design system icons ([05d0b37](https://github.com/cuencadelplata/ticketeate/commit/05d0b3741eaf0c52637516d3a7cf6480abb60adc))
* design system section ([#48](https://github.com/cuencadelplata/ticketeate/issues/48)) ([153f8e1](https://github.com/cuencadelplata/ticketeate/commit/153f8e159ea8ad40dbe60983a4fd91fec49f10f9))
* form event ([df7d0d3](https://github.com/cuencadelplata/ticketeate/commit/df7d0d3eed98ee7ae7ed4eaf7ee886d517176f2f))
* form event ([3daec63](https://github.com/cuencadelplata/ticketeate/commit/3daec63bf26d6ce57eddaf4f22fab250e84ea771))
* form event ([fd7231c](https://github.com/cuencadelplata/ticketeate/commit/fd7231c6b322d19050faec5ded451dc7e84f8e5d))
* form event ([#3](https://github.com/cuencadelplata/ticketeate/issues/3)) ([6b805fe](https://github.com/cuencadelplata/ticketeate/commit/6b805fe62241c1f7c3bd44b8b406009579aca552))
* implementar detalle de evento con disponibilidad en tiempo real ([ba7cfee](https://github.com/cuencadelplata/ticketeate/commit/ba7cfee9e945c532d93a6bbcda34aa5aff2f853b))
* implementar listado de eventos con paginación y filtros ([54a4ea4](https://github.com/cuencadelplata/ticketeate/commit/54a4ea4aa5483cc2f200d60c81738ad7121ef0df))
* middleware hono - endpoints - image upload ([b6d3b4e](https://github.com/cuencadelplata/ticketeate/commit/b6d3b4ea421d4ce10e7473da8a19f8d587b886f8))
* middleware hono - tanstack query ([43874da](https://github.com/cuencadelplata/ticketeate/commit/43874da416dd59b68f1150a41d5c64ca17ca2f37))
* middleware hono - tanstack query ([b3b7dd2](https://github.com/cuencadelplata/ticketeate/commit/b3b7dd21fd9777f8056403d94e01ee8c5b6cbc13))
* middleware hono - tanstack query ([e8821f5](https://github.com/cuencadelplata/ticketeate/commit/e8821f589443a87034583b33120cc1544718667b))
* middleware hono - tanstack query ([d409cc8](https://github.com/cuencadelplata/ticketeate/commit/d409cc8410b6fdfeb2bb9847540a6b96085e994b))
* middleware hono - tanstack query ([d3270e9](https://github.com/cuencadelplata/ticketeate/commit/d3270e9ab8c2795d8536d61fe29e4c9b0bbd99ce))
* middleware hono - tanstack query ([6907bf8](https://github.com/cuencadelplata/ticketeate/commit/6907bf893cf55561015b17f6e0ca1940a54ea0b9))
* middleware hono - tanstack query ([3d524ee](https://github.com/cuencadelplata/ticketeate/commit/3d524ee9a9e0094b9be29200fe701171a2196ab9))
* middleware hono - tanstack query ([#16](https://github.com/cuencadelplata/ticketeate/issues/16)) ([3a7f7fd](https://github.com/cuencadelplata/ticketeate/commit/3a7f7fd241771d17aecd419662cb8a68e0043164))
* pay tickets ([a571e43](https://github.com/cuencadelplata/ticketeate/commit/a571e4365ce5380b355fd5823d6013a42e52d5bd))
* restore semantic-release git plugins to enable CHANGELOG commit ([#84](https://github.com/cuencadelplata/ticketeate/issues/84)) ([c68ee9c](https://github.com/cuencadelplata/ticketeate/commit/c68ee9c7f31c894a7cd059549fb2b75a53d58ec6))
* restore semantic-release git plugins to enable CHANGELOG commits with PAT ([e7f05d5](https://github.com/cuencadelplata/ticketeate/commit/e7f05d53219989e6bc903d7ff5d3df9936c2a906))
* restore semantic-release git plugins to enable CHANGELOG commits with PAT ([6f632a4](https://github.com/cuencadelplata/ticketeate/commit/6f632a4c9a6c3b021c1f3d6b6dae183fa224b308))
* wallet config ([8e11930](https://github.com/cuencadelplata/ticketeate/commit/8e119306949875fa07a50f1b1d238ccf58c724a8))
* wallet link ([202a6fc](https://github.com/cuencadelplata/ticketeate/commit/202a6fc0eef0d842703edaccca203be1718670fc))
* wallet link ([b4eeac0](https://github.com/cuencadelplata/ticketeate/commit/b4eeac03790c155563cf81953b96718e0510c512))


### BREAKING CHANGES

* Tagging system changed from manual to semantic-release
