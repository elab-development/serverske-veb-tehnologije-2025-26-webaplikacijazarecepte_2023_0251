import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ButtonComponent } from '../../common/button/button.component';
import { RecipeService } from '../../common/recipe.service';
import { Recipe } from '../../common/card/card.component';
import { EnvConfigService } from '../../common/env-config.service';

interface MealArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  category: string;
}

interface MealResponse {
  source: string;
  articles: MealArticle[];
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  recipeOfMonth: Recipe | null = null;
  mealArticles: MealArticle[] = [];
  mealSource: string = '';
  loadingMeals: boolean = false;

  constructor(
    private router: Router,
    private recipeService: RecipeService,
    private http: HttpClient,
    private envConfig: EnvConfigService
  ) {}

  ngOnInit(): void {
    this.loadRecipeOfMonth();
    this.loadMeals();
  }

  private loadRecipeOfMonth(): void {
    this.recipeService.getAllRecipes().subscribe((recipes) => {
      if (recipes.length === 0) return;
      const ratedRecipes = recipes.filter((r) => r.totalRatings > 0);
      if (ratedRecipes.length > 0) {
        this.recipeOfMonth = ratedRecipes.reduce((best, r) =>
          r.averageRating > best.averageRating ? r : best
        );
      } else {
        this.recipeOfMonth = recipes[0];
      }
    });
  }

  private loadMeals(): void {
    this.loadingMeals = true;
    const apiUrl = this.envConfig.apiUrl;
    this.http
      .get<MealResponse>(`${apiUrl}/meal-search?q=chicken`)
      .pipe(
        catchError(() => {
          return of({
            source: 'Demo vesti (offline)',
            articles: [
              {
                title: 'Chicken Handi',
                description:
                  'Mladi kuvari donose svez pristup tradicionalnim receptima.',
                url: '#',
                publishedAt: new Date().toISOString(),
                category: 'Meal',
              },
              {
                title: 'Beef Stroganoff',
                description:
                  'Vodic kroz najbolje sezonske namirnice za jun 2026.',
                url: '#',
                publishedAt: new Date().toISOString(),
                category: 'Meal',
              },
              {
                title: 'Chocolate Cake',
                description:
                  'Saveti profesionalnih pekara za domaci hleb sa hrskavom koricom.',
                url: '#',
                publishedAt: new Date().toISOString(),
                category: 'Meal',
              },
            ],
          });
        })
      )
      .subscribe((data) => {
        this.mealSource = data.source;
        this.mealArticles = data.articles || [];
        this.loadingMeals = false;
      });
  }

  get recipeRating(): string {
    if (!this.recipeOfMonth || this.recipeOfMonth.totalRatings === 0) {
      return 'Nema ocena';
    }
    return `${this.recipeOfMonth.averageRating.toFixed(1)} / 5 (${this.recipeOfMonth.totalRatings})`;
  }

  getTasteDisplay(taste: string): string {
    const tasteMap: { [key: string]: string } = {
      slatko: 'Slatko',
      slano: 'Slano',
      ljuto: 'Ljuto',
      kiselo: 'Kiselo',
    };
    return tasteMap[taste] || taste;
  }

  navigateToBrowse(): void {
    this.router.navigate(['/browse']);
  }

  navigateToRecipe(): void {
    if (this.recipeOfMonth) {
      this.router.navigate(['/recipe', this.recipeOfMonth.id]);
    }
  }
}
