import { defineBackend } from '@aws-amplify/backend';
import { PythonLambdaConstruct } from './custom/fastapi/resource';
import * as lambda from 'aws-cdk-lib/aws-lambda';

const backend = defineBackend({});

const pythonLambda = new PythonLambdaConstruct(
	backend.createStack('myLambdaStack'),
	'MyLambda',
	{
		functionName: 'MyLambdaFunction',
		runtime: lambda.Runtime.PYTHON_3_12,
		sourceDirectory: 'amplify/custom/fastapi/src',
		handler: 'index.handler',
	}
);

backend.addOutput({
	custom: {
		[pythonLambda.lambdaFunction.functionName]: {
			name: pythonLambda.lambdaFunction.functionName,
			arn: pythonLambda.lambdaFunction.functionArn,
		},
	},
});
