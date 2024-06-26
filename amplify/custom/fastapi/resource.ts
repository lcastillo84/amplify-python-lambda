import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { execSync } from 'child_process';
import { Duration } from 'aws-cdk-lib';

const DEFAULT_LAMBDA_TIMEOUT = 5;
const DEFAULT_LAMBDA_MEMORY_SIZE = 128;

type PythonLambdaConstructProps = {
	functionName: string;
	handler: string;
	runtime: lambda.Runtime;
	sourceDirectory: string;
};

export class PythonLambdaConstruct extends Construct {
	public readonly lambdaFunction: lambda.Function;
	constructor(scope: Construct, id: string, props: PythonLambdaConstructProps) {
		super(scope, id);
		const { functionName, runtime, sourceDirectory, handler } = props;

		this.lambdaFunction = new lambda.Function(scope, functionName, {
			runtime: runtime,
			handler: handler,
			code: lambda.Code.fromAsset(sourceDirectory, {
				bundling: {
					image: runtime.bundlingImage,
					command: [],
					local: {
						tryBundle(outputDir: string) {
							try {
								execSync('poetry --version');
							} catch {
								return false;
							}

							const commands = [
								`cd ${sourceDirectory}`,
								`poetry export -f requirements.txt --output ${outputDir}/requirements.txt --without-hashes --without dev`,
								`pip install -r ${outputDir}/requirements.txt -t ${outputDir}`,
								`cp -a . ${outputDir}`,
							];

							execSync(commands.join(' && '));
							return true;
						},
					},
				},
			}),
			memorySize: DEFAULT_LAMBDA_MEMORY_SIZE,
			timeout: Duration.seconds(DEFAULT_LAMBDA_TIMEOUT),
		});
	}
}
