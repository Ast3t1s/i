#!/bin/bash

#Строка запуска скрипта выглядит так
# ./deploy.sh --version alpha --project wf-region --exclude-test true --compile \*
# ./deploy.sh --version alpha --project wf-central --exclude-test false --compile wf-base storage-temp storage-static

#Setting-up variables
export LANG=en_US.UTF-8

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
		--compile)
			saCompile=
			saCompile[0]="$2"
			saCompile[1]="$3"
			saCompile[2]="$4"
			shift
			;;
		*)
			echo "bad option"
			exit 1
			;;
	esac
shift
done

sDate=`date "+%Y.%m.%d-%H.%M.%S"`
let nTimeout=1

#Определяем сервер для установки
if [[ $sVersion == "alpha" && $sProject == "central-js" ]] || [[ $sVersion == "alpha" && $sProject == "wf-central" ]]; then
		sHost="test.igov.org.ua"
		TMP=TEMP=TMPDIR=/tmp/c_alpha && export TMPDIR TMP TEMP
		mkdir -p $TMP
fi
#if [[ $sVersion == "beta" && $sProject == "central-js" ]] || [[ $sVersion == "alpha" && $sProject == "wf-central" ]]; then
#		sHost="test-version.igov.org.ua"
#fi
#if [[ $sVersion == "prod" && $sProject == "central-js" ]] || [[ $sVersion == "alpha" && $sProject == "wf-central" ]]; then
#		sHost="igov.org.ua"
#fi

if [[ $sVersion == "alpha" && $sProject == "dashboard-js" ]] || [[ $sVersion == "alpha" && $sProject == "wf-region" ]]; then
		sHost="test.region.igov.org.ua"
		TMP=TEMP=TMPDIR=/tmp/r_alpha && export TMPDIR TMP TEMP
		mkdir -p $TMP 
fi
#if [[ $sVersion == "beta" && $sProject == "dashboard-js" ]] || [[ $sVersion == "alpha" && $sProject == "wf-region" ]]; then
#		sHost="test-version.region.igov.org.ua"
#fi
#if [[ $sVersion == "prod" && $sProject == "dashboard-js" ]] || [[ $sVersion == "alpha" && $sProject == "wf-region" ]]; then
#		sHost="region.igov.org.ua"
#fi

build_central-js ()
{
	if [ "$bSkipBuild" == "true" ]; then
		echo "Deploy to host: $sHost"
		cd central-js
		rsync -az --delete -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' dist/ sybase@$sHost:/sybase/.upload/central-js/
		return
	fi
	if [ "$bSkipDeploy" == "true" ]; then
		cd central-js
		npm cache clean
		npm install
		bower install
		npm install grunt-contrib-imagemin
		grunt build
		cd dist
		npm install --production
		cd ..
		return
	else
		cd central-js
		npm cache clean
		npm install
		bower install
		npm install grunt-contrib-imagemin
		grunt build
		cd dist
		npm install --production
		cd ..
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
		return
	else
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
		rsync -az --delete -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' dist/ sybase@$sHost:/sybase/.upload/dashboard-js/
		cd ..
	fi
}

build_base ()
{
	if [ "$bSkipTest" ==  "true" ]; then
		local sBuildArg="-DskipTests=true"
	fi
#	for sArrComponent in "${saCompile[@]}"
#	do
#		case "$sArrComponent" in
#		storage-static)
#			echo  "will build $sArrComponent"
#			cd storage-static
#			mvn -P $sVersion clean install $sBuildArg
#			cd ..
#			;;
#		storage-temp)
#			echo  "will build $sArrComponent"
#			cd storage-temp
#			mvn -P $sVersion clean install $sBuildArg
#			cd ..
#			;;
#		wf-base)
#			echo  "will build $sArrComponent"
#			cd wf-base
#			mvn -P $sVersion clean install site $sBuildArg -Ddependency.locations.enabled=false
#			cd ..
#			;;
#		"*")
			echo "Build all base modules"
			cd storage-static
			mvn -P $sVersion clean install $sBuildArg
			cd ..
			cd storage-temp
			mvn -P $sVersion clean install $sBuildArg
			cd ..
			cd wf-base
			mvn -P $sVersion clean install site $sBuildArg -Ddependency.locations.enabled=false
			cd ..
#		   ;;
#		esac
#	done
}

build_central ()
{
	if [ "$bSkipBuild" == "true" ]; then
		cd wf-central
		rsync -az -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' target/wf-central.war sybase@$sHost:/sybase/.upload/
		return
	fi
	if [ "$bSkipDeploy" == "true" ]; then
		if [ "$bSkipTest" ==  "true" ]; then
			local sBuildArg="-DskipTests=true"
		fi
		build_base $saCompile
		cd wf-central
		mvn -P $sVersion clean install site $sBuildArg -Ddependency.locations.enabled=false
		return
	else
		if [ "$bSkipTest" ==  "true" ]; then
			local sBuildArg="-DskipTests=true"
		fi
		build_base $saCompile
		cd wf-central
		mvn -P $sVersion clean install site $sBuildArg -Ddependency.locations.enabled=false
		rsync -az -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' target/wf-central.war sybase@$sHost:/sybase/.upload/
	fi
}

build_region ()
{
	if [ "$bSkipBuild" == "true" ]; then
		cd wf-region
		rsync -az -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' target/wf-region.war sybase@$sHost:/sybase/.upload/
		return
	fi
	if [ "$bSkipDeploy" == "true" ]; then
		if [ "$bSkipTest" ==  "true" ]; then
			local sBuildArg="-DskipTests=true"
		fi
		build_base $saCompile
		cd wf-region
		mvn -P $sVersion clean install site $sBuildArg -Ddependency.locations.enabled=false
		return
	else
		if [ "$bSkipTest" ==  "true" ]; then
			local sBuildArg="-DskipTests=true"
		fi
		build_base $saCompile
		cd wf-region
		mvn -P $sVersion clean install site $sBuildArg -Ddependency.locations.enabled=false
		rsync -az -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' target/wf-region.war sybase@$sHost:/sybase/.upload/
	fi
}

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
if [ -z $sProject ]; then
	build_base $saCompile
	exit 0
fi
if [ -z $sHost ]; then
    echo "Cloud not select host for deploy. Wrong version or project."
	exit 1
fi
if [ "$bSkipDeploy" == "true" ]; then
	echo "Deploy dsiabled"
	exit 0
fi

echo "Connecting to remote host (Project deploy)"
cd $WORKSPACE
rsync -az -e 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no' scripts/deploy_remote.sh sybase@$sHost:/sybase/
ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no $sHost << EOF
chmod +x /sybase/deploy_remote.sh
/sybase/deploy_remote.sh $sProject $sDate
EOF
