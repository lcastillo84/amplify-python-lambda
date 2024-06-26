import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { execSync } from 'child_process';
import { Duration } from 'aws-cdk-lib';

const DEFAULT_LAMBDA_TIMEOUT = 30;
const DEFAULT_LAMBDA_MEMORY_SIZE = 256;

type PythonLambdaConstructProps = {
	functionName: string;
	handler: string;
	runtime: lambda.Runtime;
	sourceDirectory: string;
	memorySize?: 128 | 256 | 512 | 1024 | 2048;
	timeoutSeconds?: 1 | 30 | 60 | 120;
};

export class PythonLambdaConstruct extends Construct {
	public readonly lambdaFunction: lambda.Function;
	constructor(scope: Construct, id: string, props: PythonLambdaConstructProps) {
		super(scope, id);
		const {
			functionName,
			runtime,
			sourceDirectory,
			handler,
			memorySize,
			timeoutSeconds,
		} = props;

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
								execSync('pip --version');
							} catch {
								return false;
							}

							const commands = [
								`cd ${sourceDirectory}`,
								`pip install -r requirements.txt -t ${outputDir}`,
								`cp -a . ${outputDir}`,
							];

							execSync(commands.join(' && '));
							return true;
						},
					},
				},
			}),
			memorySize: memorySize || DEFAULT_LAMBDA_MEMORY_SIZE,
			timeout: Duration.seconds(timeoutSeconds || DEFAULT_LAMBDA_TIMEOUT),
		});
	}
}
