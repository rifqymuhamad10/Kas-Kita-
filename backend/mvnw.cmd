@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements. See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership. The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License. You may obtain a copy of the License at
@REM
@REM https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied. See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "UNSET_ARG0=1")
@SET "__MVNW_ARG0_NAME__=%~n0"
@CMD /V /E /D /C CALL "%~f0" %* ^& IF "!ERRORLEVEL!"=="0" EXIT /B 0 ^& EXIT /B 1
@IF "%UNSET_ARG0%"=="1" SET "__MVNW_ARG0_NAME__="

@echo off
set MAVEN_WRAPPER_JAR_NAME=maven-wrapper.jar
set MAVEN_WRAPPER_JAR="%~dp0.mvn\wrapper\%MAVEN_WRAPPER_JAR_NAME%"

if NOT DEFINED JAVA_HOME (
    echo Error: JAVA_HOME is not defined.
    echo Please set the JAVA_HOME variable in your environment.
    exit /b 1
)

set JAVACMD="%JAVA_HOME%\bin\java.exe"

if NOT EXIST %JAVACMD% (
    set JAVACMD=java
)

%JAVACMD% -Dmaven.multiModuleProjectDirectory="%~dp0." -classpath %MAVEN_WRAPPER_JAR% org.apache.maven.wrapper.MavenWrapperMain %*
