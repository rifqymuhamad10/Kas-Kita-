@echo off
title Kas Kita Backend - Constrained Memory
echo Starting Kas Kita Backend with low memory profile...

:: Kosongkan JAVA_HOME sementara biar Maven maksa narik Java 24 dari PATH Windows
set "JAVA_HOME="

:: Constrain Maven wrapper JVM memory
set MAVEN_OPTS=-Xms32m -Xmx128m -XX:+UseSerialGC

:: Run the Maven Wrapper main class directly using system Java
java -Dmaven.multiModuleProjectDirectory="%CD%\backend" -classpath "%CD%\backend\.mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain -f backend/pom.xml spring-boot:run -Dspring-boot.run.jvmArguments="-Xms64m -Xmx256m -XX:+UseSerialGC"
pause