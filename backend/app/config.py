"""
config.py — Centralised settings via pydantic-settings.
All environment variables are loaded from .env (copy from .env.example).
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./sustainability.db"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:8080,http://localhost:3000"
    APP_ENV: str = "development"
    DATA_GOV_IN_KEY: str = ""
    WAQI_TOKEN: str = "demo"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
