
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of, BehaviorSubject, catchError, tap } from 'rxjs';
import { Recipe } from './card/card.component';
import { EnvConfigService } from './env-config.service';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipesSubject = new BehaviorSubject<Recipe[]>([]);
  private allRecipes: Recipe[] = [];
  private apiUrl: string;
  
  constructor(private http: HttpClient, private envConfig: EnvConfigService) {
    this.apiUrl = this.envConfig.apiUrl;
    this.loadRecipesFromApi();
  }

  private loadRecipesFromApi(): void {
    this.http.get<Recipe[]>(`${this.apiUrl}/recipes`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching recipes from API:', error);
        return this.loadFromLocalJSON();
      })
    ).subscribe((recipes: Recipe[]) => {
      this.allRecipes = recipes;
      this.recipesSubject.next([...this.allRecipes]);
    });
  }

  private loadFromLocalJSON(): Observable<Recipe[]> {
    return this.http.get<{recipes: Recipe[]}>('/assets/data.json').pipe(
      map(data => {
        console.log('Using local JSON data as fallback');
        return (data as {recipes: Recipe[]}).recipes;
      })
    );
  }

  getAllRecipes(): Observable<Recipe[]> {
    return this.recipesSubject.asObservable();
  }

  getRecipesByCreator(creatorUsername: string): Observable<Recipe[]> {
    return this.getAllRecipes().pipe(
      map((recipes: Recipe[]) => recipes.filter((recipe: Recipe) => recipe.creator === creatorUsername))
    );
  }

  getRecipeById(id: number): Observable<Recipe | undefined> {
    return this.http.get<Recipe>(`${this.apiUrl}/recipes/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error fetching recipe ${id} from API:`, error);
        return this.getAllRecipes().pipe(
          map((recipes: Recipe[]) => recipes.find((recipe: Recipe) => recipe.id === id))
        );
      })
    );
  }

  addRecipe(recipeData: any, creatorUsername: string): Observable<Recipe> {
    const newRecipeData = {
      name: recipeData.title,
      creator: creatorUsername,
      taste: recipeData.ukus,
      meat: recipeData.tipMesa || '',
      occasion: recipeData.prilika,
      cookingMethod: recipeData.nacinPripreme,
      timeToMake: parseInt(recipeData.cookingTime),
      ingredientWeight: parseFloat(recipeData.tezinaSastojaka),
      ingredients: recipeData.ingredients,
      description: recipeData.instructions
    };

    return this.http.post<Recipe>(`${this.apiUrl}/recipes`, newRecipeData).pipe(
      tap((newRecipe: Recipe) => {
        this.allRecipes.push(newRecipe);
        this.recipesSubject.next([...this.allRecipes]);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error adding recipe via API:', error);
        const maxId = Math.max(...this.allRecipes.map(r => r.id), 0);
        const localRecipe: Recipe = {
          ...newRecipeData,
          id: maxId + 1,
          ratings: [],
          averageRating: 0,
          totalRatings: 0
        };
        
        this.allRecipes.push(localRecipe);
        this.recipesSubject.next([...this.allRecipes]);
        
        localStorage.setItem('userRecipes', JSON.stringify(
          this.allRecipes.filter(r => r.id > 5)
        ));
        
        return of(localRecipe);
      })
    );
  }
  
  rateRecipe(recipeId: number, username: string, rating: number, comment?: string): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.apiUrl}/recipes/${recipeId}/rate`, {
      username,
      rating,
      comment
    }).pipe(
      tap((updatedRecipe: Recipe) => {
        const index = this.allRecipes.findIndex(r => r.id === recipeId);
        if (index !== -1) {
          this.allRecipes[index] = updatedRecipe;
          this.recipesSubject.next([...this.allRecipes]);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error rating recipe ${recipeId}:`, error);
        return of() as Observable<Recipe>;
      })
    );
  }
}
