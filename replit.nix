{pkgs}: {
  deps = [
    pkgs.postgresql
    pkgs.gradle
    pkgs.jdk
    pkgs.android-tools
    pkgs.curl
  ];
}
