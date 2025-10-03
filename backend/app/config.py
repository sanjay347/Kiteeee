from functools import lru_cache

from dotenv import load_dotenv
from pydantic import BaseSettings, AnyHttpUrl, Field

load_dotenv()


class Settings(BaseSettings):
    frontend_url: AnyHttpUrl = Field(alias="FRONTEND_URL")
    kite_api_key: str = Field(alias="KITE_API_KEY")
    kite_api_secret: str = Field(alias="KITE_API_SECRET")
    kite_redirect_url: AnyHttpUrl = Field(alias="KITE_REDIRECT_URL")
    db_user: str = Field(alias="DB_USER")
    db_pass: str = Field(alias="DB_PASS")
    db_name: str = Field(alias="DB_NAME")
    db_host: str = Field(alias="DB_HOST")
    db_port: str = Field(alias="DB_PORT")
    jwt_secret: str = Field(alias="JWT_SECRET")

    class Config:
        case_sensitive = True
        allow_mutation = False

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.db_user}:{self.db_pass}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]
