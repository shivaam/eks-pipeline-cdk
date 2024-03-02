import boto3
import time

# Initialize the Boto3 client for CodePipeline
client = boto3.client('codepipeline', region_name='us-east-1')

# Your CodePipeline name
pipeline_name = 'eks-blueprints-workshop-pipeline'

def check_pipeline_status(pipeline_name):
    """Check the status of the specified pipeline and return any failed stages."""
    try:
        response = client.get_pipeline_state(name=pipeline_name)
        #print(response)
        failed_stages = []
        for stage in response['stageStates']:
            #stage_name = stage['stageName']
            if 'latestExecution' in stage and stage['latestExecution']['status'] == 'Failed':
                failed_stages.append(stage)
        return failed_stages
    except Exception as e:
        print(f"Error checking pipeline status: {e}")
        return None

def retry_failed_stage(pipeline_name, stage):
    """Retry the specified failed stage in the pipeline."""
    try:
        response = client.retry_stage_execution(
            pipelineName=pipeline_name,
            stageName=stage['stageName'],
            pipelineExecutionId=stage['latestExecution']['pipelineExecutionId'],
            retryMode='FAILED_ACTIONS'
        )
        print(f"Retrying stage {stage['stageName']}: {response}")
    except Exception as e:
        print(f"Error retrying stage {stage['stageName']}: {e}")

def main():
    print(f"Checking pipeline {pipeline_name} for failed stages...")
    while True:
        failed_stages = check_pipeline_status(pipeline_name)
        if failed_stages:
            print("Failed stages:", len(failed_stages), flush=True)
            for stage in failed_stages:
                retry_failed_stage(pipeline_name, stage)
            print(f"Waiting for stage {stage} to complete...")        
        else:
            print("No failed stages found.")
        
        time.sleep(60)  # Check every 60 seconds

if __name__ == "__main__":
    main()
