#!/bin/bash

#Строка запуска скрипта выглядит так
# ./deploy.sh --version alpha --project wf-region --exclude-test true --compile \*
# ./deploy.sh --version alpha --project wf-central --exclude-test false --compile wf-base storage-temp storage-static

#Setting-up variables
export LANG=en_US.UTF-8

#This will cause the shell to exit immediately if a simple command exits with a nonzero exit value.
set -e

while [[ $# > 1 ]]
do
	sKey="$1"
	case $sKey in
		--version)
			sVersion="$2"
			shift
			;;
		--project)
			sProject="$2"
			shift
			;;
		--skip-deploy)
			bSkipDeploy="$2"
			shift
			;;
		--skip-build)
			bSkipBuild="$2"
			shift
			;;
		--skip-test)
			bSkipTest="$2"
			shift
			;;
		--skip-doc)
			bSkipDoc="$2"
			shift
			;;
		--deploy-timeout)
			nSecondsWait="$2"
			shift
			;;
		--compile)
			IFS=',' read -r -a saCompile <<< "$2"
			shift
			;;
		--docker)
			bDocker="$2"
			shift
			;;
		--gitCommit)
			sGitCommit="$2"
			shift
			;;
		*)
			echo "bad option"
			exit 1
			;;
	esac
shift
done

unset IFS
sDate=`date "+%Y.%m.%d-%H.%M.%S"`

if [ -z $nSecondsWait ]; then
	nSecondsWait=185
fi

if [[ $sProject ]]; then
	if [ -d /tmp/$sProject ]; then
		rm -rf /tmp/$sProject
	fi
	mkdir /tmp/$sProject
	export TMPDIR=/tmp/$sProject
	export TEMP=/tmp/$sProject
	export TMP=/tmp/$sProject
fi
if [ "$bSkipDoc" == "true" ]; then
	sBuildDoc="site"
fi

#Определяем сервер для установки
if [[ $sVersion == "alpha" && $sProject == "central-js" ]] || [[ $sVersion == "alpha" && $sProject == "wf-central" ]]; then
		sHost="test.igov.org.ua"
fi
if [[ $sVersion == "beta" && $sProject == "central-js" ]] || [[ $sVersion == "beta" && $sProject == "wf-central" ]]; then
		sHost="test-version.igov.org.ua"
		export PATH=/usr/local/bin:$PATH
fi
#if [[ $sVersion == "prod" && $sProject == "central-js" ]] || [[ $sVersion == "alpha" && $sProject == "wf-central" ]]; then
#		sHost="igov.org.ua"
#fi

if [[ $sVersion == "alpha" && $sProject == "dashboard-js" ]] || [[ $sVersion == "alpha" && $sProject == "wf-region" ]]; then
		sHost="test.region.igov.org.ua"
fi
if [[ $sVersion == "beta" && $sProject == "dashboard-js" ]] || [[ $sVersion == "beta" && $sProject == "wf-region" ]]; then
		sHost="test-version.region.igov.org.ua"
		export PATH=/usr/local/bin:$PATH
fi
#if [[ $sVersion == "prod" && $sProject == "dashboard-js" ]] || [[ $sVersion == "alpha" && $sProject == "wf-region" ]]; then
#		sHost="region.igov.org.ua"
#fi

echo "Host $sHost will be a target server for deploy...."

build_docker ()
{
	if ! [ -x "$(command -v docker)" ]; then
	    echo "Docker is not installed."
	    exit 1
	fi

	if [ -z $sGitCommit ]; then
	    echo "We want a git commmit variable!"
	    exit 1
	fi

	git clone git@github.com:e-government-ua/iSystem.git
	rsync -rtv iSystem/config/$sVersion/$sProject/ ./
	rm -rf iSystem

	readonly DOCKER_REPO=puppet.igov.org.ua:5000
	readonly DOCKER_IMAGE=$DOCKER_REPO/$sProject"-"$sVersion
	readonly DOCKER_TAG=$sGitCommit
	readonly KUBE_RC=$sProject"-"$sVersion

	echo "Start building Docker image..."

	if ! [ -f Dockerfile ]; then
		echo "We have a proble. Dockerfile not found."
		exit 1
	fi

	mkdir /tmp/$sProject
	docker build -t $DOCKER_IMAGE .
	docker tag -f  $DOCKER_IMAGE:latest $DOCKER_IMAGE:$DOCKER_TAG
	docker push $DOCKER_IMAGE:latest
	docker push $DOCKER_IMAGE:$DOCKER_TAG
	echo "Build & push container to Docker registry finished."
#	kubectl rolling-update $KUBE_RC --image=$DOCKER_IMAGE:$DOCKER_TAG
#	echo "Rolling-update replication controller finished."
	kubectl get rc $KUBE_RC
	kubectl get rc $KUBE_RC > /dev/null 2>&1;
	if [ $? -ne 0 ]; then
  		echo "Replication controller does not exist, creating."
  		kubectl create -f kube/$KUBE_RC-rc.yaml
	else
  		echo "Deleting existing replication controller and creating new one"
		kubectl delete -f kube/$KUBE_RC-rc.yaml
		sleep 5
		kubectl create -f kube/$KUBE_RC-rc.yaml
  		if [ $? -ne 0 ]; then
    			echo "Could not create replication controller"
      			exit 1
  		fi;
	fi

	exit 0
}

build_central-js ()
{
	if [ "$bSkipBuild" == "true" ]; then
		echo "Deploy to host: $sHost"
		cd central-js
		rsync -az --delete -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' dist/ sybase@$sHost:/sybase/.upload/central-js/
		return
	fi
	if [ "$bSkipDeploy" == "true" ]; then
		while ps axg | grep -v grep | grep -q dashboard-js; do
			echo "dashboard-js compilation is still running. we will wait until it finish."
			touch /tmp/$sProject/build.lock
			sleep 15
			if [ -f /tmp/dashboard-js/build.lock ]; then
				echo "doshboard-js build.lock file found. starting compilation..."
				break
			fi
		done
		cd central-js
		npm cache clean
		npm install
		bower install
		npm install grunt-contrib-imagemin
		grunt build
		cd dist
		npm install --production
		cd ..
		rm -rf /tmp/$sProject
		return
	else
		while ps axg | grep -v grep | grep -q dashboard-js; do
			echo "dashboard-js compilation is still running. we will wait until it finish."
			touch /tmp/$sProject/build.lock
			sleep 15
			if [ -f /tmp/dashboard-js/build.lock ]; then
				echo "doshboard-js build.lock file found. starting compilation..."
				break
			fi
		done
		cd central-js
		npm cache clean
		npm install
		bower install
		npm install grunt-contrib-imagemin
		grunt build
		cd dist
		npm install --production
		cd ..
		rm -rf /tmp/$sProject
		rsync -az --delete -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' dist/ sybase@$sHost:/sybase/.upload/central-js/
		cd ..
	fi
}

build_dashboard-js ()
{
	if [ "$bSkipBuild" == "true" ]; then
		echo "Deploy to host: $sHost"
		cd dashboard-js
		rsync -az --delete -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' dist/ sybase@$sHost:/sybase/.upload/dashboard-js/
		return
	fi
	if [ "$bSkipDeploy" == "true" ]; then
		while ps axg | grep -v grep | grep -q central-js; do
			echo "central-js compilation is still running. we will wait until it finish."
			touch /tmp/$sProject/build.lock
			sleep 15
			if [ -f /tmp/central-js/build.lock ]; then
				echo "central-js build.lock file found. starting compilation..."
				break
			fi
		done
		cd dashboard-js
		npm install
		npm list grunt
		npm list grunt-google-cdn
		bower install
		npm install grunt-contrib-imagemin
		grunt build
		cd dist
		npm install --production
		cd ..
		rm -rf /tmp/$sProject
		return
	else
		while ps axg | grep -v grep | grep -q central-js; do
			echo "central-js compilation is still running. we will wait until it finish."
			touch /tmp/$sProject/build.lock
			sleep 15
			if [ -f /tmp/central-js/build.lock ]; then
				echo "central-js build.lock file found. starting compilation..."
				break
			fi
		done
		cd dashboard-js
		npm install
		npm list grunt
		npm list grunt-google-cdn
		bower install
		npm install grunt-contrib-imagemin
		grunt build
		cd dist
		npm install --production
		cd ..
		rm -rf /tmp/$sProject
		rsync -az --delete -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' dist/ sybase@$sHost:/sybase/.upload/dashboard-js/
		cd ..
	fi
}

build_base ()
{
	if [ "$bSkipTest" ==  "true" ]; then
		local sBuildArg="-DskipTests=true"
	fi
	for sArrComponent in "${saCompile[@]}"
	do
		case "$sArrComponent" in
		storage-static)
			echo  "will build $sArrComponent"
			cd storage-static
			mvn -P $sVersion clean install $sBuildArg
			cd ..
			;;
		storage-temp)
			echo  "will build $sArrComponent"
			cd storage-temp
			mvn -P $sVersion clean install $sBuildArg
			cd ..
			;;
		wf-base)
			echo  "will build $sArrComponent"
			cd wf-base
			mvn -P $sVersion clean install $sBuildDoc $sBuildArg -Ddependency.locations.enabled=false
			cd ..
			;;
		"*")
			echo "Build all base modules"
			cd storage-static
			mvn -P $sVersion clean install $sBuildArg
			cd ..
			cd storage-temp
			mvn -P $sVersion clean install $sBuildArg
			cd ..
			cd wf-base
			mvn -P $sVersion clean install $sBuildDoc $sBuildArg -Ddependency.locations.enabled=false
			cd ..
		   ;;
		esac
	done
}

build_central ()
{
	if [ "$bSkipBuild" == "true" ]; then
		cd wf-central
		if [ ! -f target/wf-central.war ]; then
			echo "File not found! Need to rebuild application..."
			if [ "$bSkipTest" ==  "true" ]; then
				local sBuildArg="-DskipTests=true"
			fi
			build_base $saCompile
			cd wf-central
			mvn -P $sVersion clean install $sBuildDoc $sBuildArg -Ddependency.locations.enabled=false
		fi
		rsync -az -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' target/wf-central.war sybase@$sHost:/sybase/.upload/
		return
	fi
	if [ "$bSkipDeploy" == "true" ]; then
		if [ "$bSkipTest" ==  "true" ]; then
			local sBuildArg="-DskipTests=true"
		fi
		build_base $saCompile
		cd wf-central
		mvn -P $sVersion clean install $sBuildDoc $sBuildArg -Ddependency.locations.enabled=false
		rm -rf /tmp/$sProject
		return
	else
		if [ "$bSkipTest" ==  "true" ]; then
			local sBuildArg="-DskipTests=true"
		fi
		build_base $saCompile
		cd wf-central
		mvn -P $sVersion clean install $sBuildDoc $sBuildArg -Ddependency.locations.enabled=false
		rm -rf /tmp/$sProject
		rsync -az -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' target/wf-central.war sybase@$sHost:/sybase/.upload/
	fi
}

build_region ()
{
	if [ "$bSkipBuild" == "true" ]; then
		cd wf-region
		if [ ! -f target/wf-region.war ]; then
			echo "File not found! Need to rebuild application..."
			if [ "$bSkipTest" ==  "true" ]; then
				local sBuildArg="-DskipTests=true"
			fi
			build_base $saCompile
			cd wf-region
			mvn -P $sVersion clean install $sBuildDoc $sBuildArg -Ddependency.locations.enabled=false
		fi
		rsync -az -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' target/wf-region.war sybase@$sHost:/sybase/.upload/
		return
	fi
	if [ "$bSkipDeploy" == "true" ]; then
		if [ "$bSkipTest" ==  "true" ]; then
			local sBuildArg="-DskipTests=true"
		fi
		build_base $saCompile
		cd wf-region
		mvn -P $sVersion clean install $sBuildDoc $sBuildArg -Ddependency.locations.enabled=false
		rm -rf /tmp/$sProject
		return
	else
		if [ "$bSkipTest" ==  "true" ]; then
			local sBuildArg="-DskipTests=true"
		fi
		build_base $saCompile
		cd wf-region
		mvn -P $sVersion clean install $sBuildDoc $sBuildArg -Ddependency.locations.enabled=false
		rm -rf /tmp/$sProject
		rsync -az -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' target/wf-region.war sybase@$sHost:/sybase/.upload/
	fi
}

if [ -z $sProject ]; then
	build_base $saCompile
	exit 0
else
	if [ $sProject == "wf-central" ]; then
		build_central
	fi
	if [ $sProject == "wf-region" ]; then
		build_region
	fi
	if [ $sProject == "central-js" ]; then
		build_central-js
	fi
	if [ $sProject == "dashboard-js" ]; then
		build_dashboard-js
	fi
fi
if [ "$bDocker" == "true" ]; then
	build_docker
fi
if [ -z $sHost ]; then
    echo "Cloud not select host for deploy. Wrong version or project."
	exit 1
fi
if [ "$bSkipDeploy" == "true" ]; then
	echo "Deploy dsiabled"
	exit 0
fi

echo "Connecting to remote host $sHost"
cd $WORKSPACE
rsync -az -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' scripts/deploy_remote.sh sybase@$sHost:/sybase/
ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no $sHost << EOF
chmod +x /sybase/deploy_remote.sh
/sybase/deploy_remote.sh $sProject $sDate $nSecondsWait
EOF
